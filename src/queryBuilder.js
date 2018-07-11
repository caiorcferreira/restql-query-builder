import {
  curry,
  compose,
  partial,
  head,
  last,
  equals,
  prop,
  cond,
  flatten,
  concat,
  reduce,
  apply,
  always as K,
  merge,
  mergeWithKey
} from 'ramda';

import multiarity from './multiarity';

import {
  createFromBlock,
  createAsBlock,
  createTimeoutBlock,
  createHeaderBlock,
  createWithBlock,
  createHiddenBlock,
  createOnlyBlock,
  createIgnoreErrorsBlock,
  createModifiersBlock
} from './blockCreators';

import { run, andThen, toBuilder } from './builder';
import stringify from './stringify';

const getObjOnlyKey = compose(
  head,
  Object.keys
);

const getApplyTargetFromBlock = function(block) {
  return cond([
    [
      compose(
        equals('with'),
        getObjOnlyKey
      ),
      compose(
        getObjOnlyKey,
        prop('with')
      )
    ],
    [
      compose(
        equals('only'),
        getObjOnlyKey
      ),
      compose(
        last,
        prop('only')
      )
    ]
  ])(block);
};

function createApplyBlock(operator, blocks) {
  const lastBlock = last(blocks);
  const blockKey = getObjOnlyKey(lastBlock);
  const applyTarget = getApplyTargetFromBlock(lastBlock);

  return {
    apply: {
      [blockKey]: {
        [applyTarget]: operator
      }
    }
  };
}

export const applyOperator = curry((reducer, builder, operator) => {
  const newBuilder = () => {
    const previousValue = builder();
    const applyed = createApplyBlock(operator, previousValue);
    return reducer(previousValue, applyed);
  };
  return newBuilder;
});

const chainQueryBuilders = partial(andThen, [
  compose(
    flatten,
    Array.of
  )
]);

const mergeQueries = (key, left, right) =>
  key === 'only' ? concat(left, right) : merge(left, right);

const queryBuilderReducer = (accumulatedInput, builderResult) => {
  return reduce(mergeWithKey(mergeQueries), {}, [accumulatedInput, ...builderResult]);
};

const runBuilder = builder => run(queryBuilderReducer, builder, {});

// Chainable builders
export const queryBuilder = (input = {}) => {
  const inputBuilder = toBuilder(input);
  const chainWithInput = builder => chainQueryBuilders(inputBuilder, builder);

  return {
    use: compose(
      chainWithInput,
      createModifiersBlock
    ),
    from: compose(
      queryBuilder,
      chainWithInput,
      createFromBlock
    ),
    as: compose(
      queryBuilder,
      chainWithInput,
      createAsBlock
    ),
    timeout: compose(
      queryBuilder,
      chainWithInput,
      createTimeoutBlock
    ),
    headers: compose(
      queryBuilder,
      chainWithInput,
      createHeaderBlock
    ),
    withClause: compose(
      queryBuilder,
      chainWithInput,
      createWithBlock
    ),
    only: compose(
      queryBuilder,
      chainWithInput,
      createOnlyBlock
    ),
    hidden: compose(
      queryBuilder,
      chainWithInput,
      createHiddenBlock
    ),
    ignoreErrors: compose(
      queryBuilder,
      chainWithInput,
      createIgnoreErrorsBlock
    ),
    apply: compose(
      queryBuilder,
      partial(applyOperator, [
        compose(
          flatten,
          Array.of
        ),
        input
      ])
    ),
    toObject: () => runBuilder(input),
    toString: () => stringify(runBuilder(input))
  };
};

// Pointless style builders
const pointlessBuilder = curry((builder, input) => {
  const inputBuilder = toBuilder(input);
  return chainQueryBuilders(inputBuilder, builder);
});

const useBuilder = (modifiers, input = {}) =>
  pointlessBuilder(createModifiersBlock(modifiers), input);

export const use = multiarity({
  1: partial(useBuilder),
  n: apply(asBuilder)
});

const fromBuilder = (resourceName, input = {}) =>
  pointlessBuilder(createFromBlock(resourceName), input);

export const from = multiarity({
  1: partial(fromBuilder),
  n: apply(fromBuilder)
});

const asBuilder = (resourceAlias, input = {}) =>
  pointlessBuilder(createAsBlock(resourceAlias), input);

export const as = multiarity({
  1: partial(asBuilder),
  n: apply(asBuilder)
});

const timeoutBuilder = (timeoutValue, input = {}) =>
  pointlessBuilder(createTimeoutBlock(timeoutValue), input);

export const timeout = multiarity({
  1: partial(timeoutBuilder),
  n: apply(timeout)
});

const headersBuilder = (headers, input = {}) => pointlessBuilder(createHeaderBlock(headers), input);

export const headers = multiarity({
  1: partial(headersBuilder),
  n: apply(headersBuilder)
});

const withBuilder = (paramName, paramValue, input = {}) =>
  pointlessBuilder(createWithBlock(paramName, paramValue), input);

export const withClause = multiarity({
  1: ([paramName]) => paramValue => (input = {}) => withBuilder(paramName, paramValue, input),
  2: partial(withBuilder),
  n: apply(withBuilder)
});

const onlyBuilder = (filters, input = {}) => pointlessBuilder(createOnlyBlock(filters), input);

export const only = multiarity({
  1: partial(onlyBuilder),
  n: apply(onlyBuilder)
});

const hiddenBuilder = (shouldBeHidden, input = {}) =>
  pointlessBuilder(createHiddenBlock(shouldBeHidden), input);

export const hidden = multiarity({
  0: K(partial(hiddenBuilder, [true])),
  1: partial(hiddenBuilder),
  n: apply(hiddenBuilder)
});

const ignoreErrorsBuilder = (shouldIgnore, input = {}) =>
  pointlessBuilder(createIgnoreErrorsBlock(shouldIgnore), input);

export const ignoreErrors = multiarity({
  0: K(partial(ignoreErrorsBuilder, [true])),
  1: partial(ignoreErrorsBuilder),
  n: apply(ignoreErrorsBuilder)
});

export const toObject = runBuilder;

export const toString = compose(
  stringify,
  toObject
);
