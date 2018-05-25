import {
  curry,
  compose,
  map,
  head,
  last,
  apply,
  equals,
  assoc,
  assocPath,
  prop,
  fromPairs,
  cond,
  is,
  flatten,
  always as K,
  identity as I,
  call as S
} from 'ramda';

const toArray = cond([[is(Array), I], [K(true), Array.of]]);

export const run = curry((reducer, builder, accumulatedInput) => {
  return reducer(accumulatedInput, builder());
});

export const andThen = curry((reducer, builderList) => {
  const chainedBuilder = () => {
    const builderValues = map(S, builderList);
    return apply(reducer, builderValues);
  };

  return chainedBuilder;
});

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

export const queryBuilder = input => {
  return {
    from: andThen(compose(flatten, Array.of), [input])
  };
};
