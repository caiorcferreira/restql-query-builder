import 'babel-polyfill';
import 'reflect-metadata';
import {
  compose,
  assoc,
  assocPath,
  fromPairs,
  is,
  identity,
  always,
  cond,
  chain,
  tap,
  __
} from 'ramda';

import stringify from './stringify';
import { context, setContext } from './context';

const toArray = cond([[is(Array), identity], [always(true), Array.of]]);

const modifiers = context(function(query, ...modifiersPairs) {
  return compose(
    assoc('modifiers', __, query),
    tap(setContext('MODIFIERS', __, query)),
    fromPairs
  )(modifiersPairs);
});

const from = context(function(query, endpoint) {
  return compose(assoc('from', endpoint), setContext('FROM', endpoint))(query);
});

const as = context(function(query, alias) {
  return assoc('as', alias, query);
});

const headers = context(function(query, ...headersPairs) {
  return compose(headers => assoc('headers', headers, query), fromPairs)(headersPairs);
});

const timeout = context(function(query, timeoutValue) {
  return assoc('timeout', timeoutValue, query);
});

const withClause = context(function(query, key, value) {
  const newQuery = assocPath(['with', key], value, query);
  Reflect.defineMetadata('WITH_CLAUSE', { [key]: value }, newQuery);
  return newQuery;
});

const only = context(function(query, ...onlyFilters) {
  return assoc('only', onlyFilters, query);
});

const hidden = context(function(query) {
  return assoc('hidden', true, query);
});

const ignoreErrors = context(function(query) {
  return assoc('ignoreErrors', true, query);
});

const apply = context(function(query, funcName) {
  return assocPath(['apply', 'with', 'using'], funcName, query);
});

const concatQueries = context(function(aQuery, otherQuery) {
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
    hidden: compose(queryBuilder, hidden(query)),
    ignoreErrors: compose(queryBuilder, ignoreErrors(query)),
    apply: compose(queryBuilder, apply(query)),
    concat: concatQueries(query),
    toQueryString: () => stringify(query),
    toQueryMap: () => query
  };
}

export default queryBuilder;
