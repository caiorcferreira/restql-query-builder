import 'babel-polyfill';
import { curry, compose, assoc, assocPath } from 'ramda';

import stringify from './stringify';

const from = curry(function(query, endpoint) {
  return assoc('from', endpoint, query);
});

const as = curry(function(query, alias) {
  return assoc('as', alias, query);
});

const withClause = curry(function(query, key, value) {
  return assocPath(['with', key], value, query);
});

const only = function(query) {
  return (...onlyFilters) => assoc('only', onlyFilters, query);
};

function queryBuilder(query = {}) {
  return {
    from: compose(queryBuilder, from(query)),
    as: compose(queryBuilder, as(query)),
    with: compose(queryBuilder, withClause(query)),
    only: compose(queryBuilder, only(query)),
    toQueryString: () => stringify(query),
    toQueryMap: () => query
  };
}

export default queryBuilder;
