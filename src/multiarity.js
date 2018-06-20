import {
  compose,
  map,
  cond,
  omit,
  append,
  prop,
  toPairs,
  equals,
  length,
  toString,
  always as K
} from 'ramda';

export default function multiarity(definition) {
  const arityFns = compose(
    map(([arity, fn]) => [
      compose(
        equals(arity),
        toString,
        length
      ),
      fn
    ]),
    toPairs,
    omit(['n'])
  )(definition);

  const defaultCaseFn = prop('n', definition);
  const multiFunctions = defaultCaseFn ? append([K(true), defaultCaseFn], arityFns) : arityFns;

  return (...args) => cond(multiFunctions)(args);
}
