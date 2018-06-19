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
  length,
  apply,
  append,
  always as K,
  merge,
  mergeWithKey
} from 'ramda';

import multimethod from './multimethod';

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
    with: compose(
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

export const use = curry((modifiers, input) =>
  pointlessBuilder(createModifiersBlock(modifiers), input)
);

export const fromClause = (resourceName, input = {}) =>
  pointlessBuilder(createFromBlock(resourceName), input);

export const from = multimethod({
  1: partial(fromClause),
  n: apply(fromClause)
});

export const as = curry((resourceAlias, input) =>
  pointlessBuilder(createAsBlock(resourceAlias), input)
);

export const timeout = curry((timeoutValue, input) =>
  pointlessBuilder(createTimeoutBlock(timeoutValue), input)
);

export const headers = curry((headers, input) =>
  pointlessBuilder(createHeaderBlock(headers), input)
);

export const withClause = curry((paramName, paramValue, input) =>
  pointlessBuilder(createWithBlock(paramName, paramValue), input)
);

export const only = curry((filters, input) => pointlessBuilder(createOnlyBlock(filters), input));

const hiddenClause = curry((shouldBeHidden, input) => {
  return pointlessBuilder(createHiddenBlock(shouldBeHidden), input);
});

export const hidden = multimethod({
  0: K(hiddenClause(true)),
  1: partial(hiddenClause),
  n: apply(hiddenClause)
});

export const ignoreErrorsClause = curry((shouldIgnore, input) => {
  return pointlessBuilder(createIgnoreErrorsBlock(shouldIgnore), input);
});

export const ignoreErrors = multimethod({
  0: K(ignoreErrorsClause(true)),
  1: partial(ignoreErrorsClause),
  n: apply(ignoreErrorsClause)
});

export const toObject = runBuilder;

export const toString = compose(
  stringify,
  toObject
);
