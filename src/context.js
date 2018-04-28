import 'reflect-metadata';
import {
  compose,
  curry,
  map,
  cond,
  is,
  always,
  identity,
  contains,
  any,
  length,
  inc,
  flip,
  filter,
  not,
  equals,
  __,
  always as K
} from 'ramda';

export const CONTEXT_INSTANCE_KEY = 'CONTEXT_INSTANCE';

export const toArray = cond([[is(Array), identity], [always(true), Array.of]]);

export const getMetadataFromTargetWithKey = flip(Reflect.getOwnMetadata);
export const getMetadataKeys = Reflect.getOwnMetadataKeys;
export const defineMetadata = curry((target, key, value) => {
  Reflect.defineMetadata(key, value, target);
  return target;
});

export function getContextFromTarget(target) {
  return compose(
    map(getMetadataFromTargetWithKey(target)),
    filter(compose(not, equals(CONTEXT_INSTANCE_KEY))),
    getMetadataKeys
  )(target);
}

export const setContext = curry((contextKey, params, target) => {
  const metadataIndex = compose(inc, length, getMetadataKeys)(target);
  const context = {
    key: contextKey,
    params: toArray(params)
  };

  return defineMetadata(target, metadataIndex, context);
});

export const copyMetadata = curry(function(origin, target) {
  const metadataKeys = Reflect.getOwnMetadataKeys(origin);
  metadataKeys.forEach(aKey => {
    const metadata = Reflect.getOwnMetadata(aKey, origin);
    Reflect.defineMetadata(aKey, metadata, target);
  });
  return target;
});

export const isContextInstance = compose(
  cond([
    [is(Object), compose(contains(CONTEXT_INSTANCE_KEY), getMetadataKeys)],
    [K(true), K(false)]
  ])
);

export function hasContextInstance(params) {
  return any(isContextInstance, params);
}

export const setTargetAsContextInstance = defineMetadata(__, 'CONTEXT_INSTANCE', true);

export function bindContext(contextKey, evaluator) {
  return (...params) => {
    const result = evaluator(...params);
    const paramsWithoutContextInstance = filter(compose(not, isContextInstance), params);

    return compose(
      setContext(contextKey, paramsWithoutContextInstance),
      cond([[K(hasContextInstance(params)), identity], [K(true), setTargetAsContextInstance]])
    )(result);
  };
}
