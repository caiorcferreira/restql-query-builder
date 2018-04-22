import 'babel-polyfill';
import {
  curry,
  compose,
  assoc,
  assocPath,
  fromPairs,
  is,
  identity,
  always,
  cond,
  chain
} from 'ramda';

import stringify from './stringify';

const modifiers = function(query) {
  return (...modifiersPairs) =>
    compose(modifiers => assoc('modifiers', modifiers, query), fromPairs)(modifiersPairs);
};

const from = curry(function(query, endpoint) {
  return assoc('from', endpoint, query);
});

const as = curry(function(query, alias) {
  return assoc('as', alias, query);
});

const headers = function(query) {
  return (...headersPairs) =>
    compose(headers => assoc('headers', headers, query), fromPairs)(headersPairs);
};

const timeout = curry(function(query, timeoutValue) {
  return assoc('timeout', timeoutValue, query);
});

const withClause = curry(function(query, key, value) {
  return assocPath(['with', key], value, query);
});

const only = function(query) {
  return (...onlyFilters) => assoc('only', onlyFilters, query);
};

const hidden = function(query) {
  return assoc('hidden', true, query);
};

const ignoreErrors = function(query) {
  return assoc('ignoreErrors', true, query);
};

const toArray = cond([[is(Array), identity], [always(true), Array.of]]);

const concatQueries = curry(function(aQuery, otherQuery) {
  return chain(toArray, [aQuery, otherQuery]);
});

function queryBuilder(query = {}) {
  return {
    modifiers: compose(queryBuilder, modifiers(query)),
    from: compose(queryBuilder, from(query)),
    as: compose(queryBuilder, as(query)),
    headers: compose(queryBuilder, headers(query)),
    timeout: compose(queryBuilder, timeout(query)),
    with: compose(queryBuilder, withClause(query)),
    only: compose(queryBuilder, only(query)),
    hidden: compose(queryBuilder, () => hidden(query)),
    ignoreErrors: compose(queryBuilder, () => ignoreErrors(query)),
    concat: concatQueries(query),
    toQueryString: () => stringify(query),
    toQueryMap: () => query
  };
}

export default queryBuilder;
