import { curry, map, apply, call as S } from 'ramda';

export const run = curry((reducer, builder, accumulatedInput) => {
  return reducer(accumulatedInput, builder());
});

export const andThen = (reducer, ...builderList) => {
  const chainedBuilder = () => {
    const builderValues = map(S, builderList);
    return apply(reducer, builderValues);
  };

  return chainedBuilder;
};
