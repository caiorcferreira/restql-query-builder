import 'reflect-metadata';
import { curry, append, cond, is, always, identity } from 'ramda';

export const copyMetadata = curry(function(origin, target) {
  const metadataKeys = Reflect.getOwnMetadataKeys(origin);
  metadataKeys.forEach(aKey => {
    const metadata = Reflect.getOwnMetadata(aKey, origin);
    Reflect.defineMetadata(aKey, metadata, target);
  });
  return target;
});

export const context = function(fn) {
  return query => {
    return (...params) => {
      const result = fn(query, ...params);
      return copyMetadata(query, result);
    };
  };
};

export const getContextFromQuery = function(query) {
  const metadataKeys = Reflect.getOwnMetadataKeys(query);

  return metadataKeys.reduce((metadata, key) => {
    const metadataValue = Reflect.getOwnMetadata(key, query);
    return append({ form: key, params: metadataValue }, metadata);
  }, []);
};

const toArray = cond([[is(Array), identity], [always(true), Array.of]]);

export const setContext = curry((key, params, query) => {
  Reflect.defineMetadata(key, toArray(params), query);
  return query;
});
