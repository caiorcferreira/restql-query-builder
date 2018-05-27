import {
  curry,
  compose,
  partial,
  head,
  last,
  equals,
  assoc,
  assocPath,
  prop,
  fromPairs,
  cond,
  is,
  flatten,
  mergeAll,
  always as K,
  identity as I
} from 'ramda';

import { run, andThen } from './builder';

const toArray = cond([[is(Array), I], [K(true), Array.of]]);

const getObjOnlyKey = compose(head, Object.keys);

const getApplyTargetFromBlock = function(block) {
  return cond([
    [compose(equals('with'), getObjOnlyKey), compose(getObjOnlyKey, prop('with'))],
    [compose(equals('only'), getObjOnlyKey), last]
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

export const createFromBlock = function(fromResource) {
  return K(assoc('from', fromResource, {}));
};

export const createAsBlock = function(resourceAlias) {
  return K(assoc('as', resourceAlias, {}));
};

export const createTimeoutBlock = function(timeoutValue) {
  return K(assoc('timeout', timeoutValue, {}));
};

export const createHeaderBlock = function(headers) {
  const headerObj = fromPairs(headers);
  return K(assoc('headers', headerObj, {}));
};

export const createWithBlock = curry(function(paramName, paramValue) {
  return K(assocPath(['with', paramName], paramValue, {}));
});

export const createOnlyBlock = function(filters) {
  return K(assoc('only', filters, {}));
};

export const createHiddenBlock = function(shouldBeHidden) {
  return K(assoc('hidden', shouldBeHidden, {}));
};

export const createIgnoreErrorsBlock = function(shouldIgnoreErrors) {
  return K(assoc('ignoreErrors', shouldIgnoreErrors, {}));
};

export const createModifiersBlock = function(modifiers) {
  const modifiersObj = fromPairs(modifiers);
  return K(assoc('modifiers', modifiersObj, {}));
};

const chainBuilders = partial(andThen, [compose(flatten, Array.of)]);

const builderReducer = (accumulatedInput, builderResult) => {
  return mergeAll([accumulatedInput, ...builderResult]);
};

const toBuilder = cond([[is(Function), I], [K(true), K]]);

export const queryBuilder = input => {
  const inputBuilder = toBuilder(input);
  const chainWithInput = builder => chainBuilders(inputBuilder, builder);

  return {
    use: compose(chainWithInput, createModifiersBlock),
    from: compose(queryBuilder, chainWithInput, createFromBlock),
    as: compose(queryBuilder, chainWithInput, createAsBlock),
    timeout: compose(queryBuilder, chainWithInput, createTimeoutBlock),
    headers: compose(queryBuilder, chainWithInput, createHeaderBlock),
    with: compose(queryBuilder, chainWithInput, createWithBlock),
    only: compose(queryBuilder, chainWithInput, createOnlyBlock),
    hidden: compose(queryBuilder, chainWithInput, createHiddenBlock),
    ignoreErrors: compose(queryBuilder, chainWithInput, createIgnoreErrorsBlock),
    apply: compose(queryBuilder, partial(applyOperator, [compose(flatten, Array.of), input])),
    toObject: () => run(builderReducer, input, {})
  };
};
