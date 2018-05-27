import { curry, map, apply, cond, is, identity as I, always as K, call as S } from 'ramda';

const toArray = cond([[is(Array), I], [K(true), Array.of]]);

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
