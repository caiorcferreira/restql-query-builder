import { curry, map, apply, cond, is, identity as I, always as K, call as S } from 'ramda';

export const toBuilder = cond([[is(Function), I], [K(true), K]]);

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
