import {
  __,
  curry,
  compose,
  assoc,
  assocPath,
  merge,
  fromPairs,
  cond,
  is,
  identity,
  always,
  mergeWith,
  concat
} from 'ramda';

const toArray = cond([[is(Array), identity], [always(true), Array.of]]);

export const run = function(builder, input) {
  return builder(input);
};

export const andThen = curry(function(firstBuilder, secondBuilder) {
  const chainedFn = input => {
    const firstResult = run(firstBuilder, input);

    const firstAccumulatedResult = firstResult[1];
    const secondResult = run(secondBuilder, firstAccumulatedResult);

    return secondResult;
  };

  return chainedFn;
});

export const bmap = curry(function(f, builder) {
  return input => {
    const result = run(builder, input);
    const value = result[0];

    const newValue = f(value);

    return [newValue, result[1]];
  };
});

export const fromBuilder = function(fromResource) {
  return accumulatedValue => {
    const newValue = assoc('from', fromResource, {});
    const accumlatedResult = merge(accumulatedValue, newValue);
    return [newValue, accumlatedResult];
  };
};

export const asBuilder = function(resultAlias) {
  return accumulatedValue => {
    const newValue = assoc('as', resultAlias, {});
    const accumlatedResult = merge(accumulatedValue, newValue);
    return [newValue, accumlatedResult];
  };
};

export const timeoutBuilder = function(timeoutValue) {
  return accumulatedValue => {
    const newValue = assoc('timeout', timeoutValue, {});
    const accumlatedResult = merge(accumulatedValue, newValue);
    return [newValue, accumlatedResult];
  };
};

export const headerBuilder = function(headersPairs) {
  return accumulatedValue => {
    const newValue = compose(assoc('headers', __, {}), fromPairs)(headersPairs);
    const accumlatedResult = merge(accumulatedValue, newValue);
    return [newValue, accumlatedResult];
  };
};

export const withBuilder = curry(function(paramName, paramValue) {
  return accumulatedValue => {
    const newValue = assocPath(['with', paramName], paramValue, {});
    const accumlatedResult = merge(accumulatedValue, newValue);
    return [newValue, accumlatedResult];
  };
});

export const onlyBuilder = function(onlyItems) {
  return accumulatedValue => {
    const newValue = assoc('only', toArray(onlyItems), {});
    const accumlatedResult = mergeWith(concat, accumulatedValue, newValue);
    return [newValue, accumlatedResult];
  };
};

export const hiddenBuilder = function() {
  return accumulatedValue => {
    const newValue = assoc('hidden', true, {});
    const accumlatedResult = merge(accumulatedValue, newValue);
    return [newValue, accumlatedResult];
  };
};

export const ignoreErrorsBuilder = function() {
  return accumulatedValue => {
    const newValue = assoc('ignoreErrors', true, {});
    const accumlatedResult = merge(accumulatedValue, newValue);
    return [newValue, accumlatedResult];
  };
};

export const modifiersBuilder = function(modifiersPairs) {
  return accumulatedValue => {
    const newValue = compose(assoc('modifiers', __, {}), fromPairs)(modifiersPairs);
    const accumlatedResult = merge(accumulatedValue, newValue);
    return [newValue, accumlatedResult];
  };
};

export const applyBuilder = function(builder, applyFunctionName) {
  return accumulatedValue => {
    const apply = bmap(value => {
      return { apply: { with: { using: 'flatten' } } };
    }, builder);

    const result = apply(accumulatedValue);
    const accumlatedResult = merge(result[1], result[0]);
    return [result[0], accumlatedResult];
  };
};
