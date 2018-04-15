import 'babel-polyfill';
import { zip, isEmpty, isNil } from 'ramda';

const queryBuilder = (query = {}) => ({
  toQueryString: toQueryString(query)
});

const toQueryString = query => () => {
  return `${endpointFormToString(query)}${filtersFormToString(query)}`;
};

const endpointFormToString = query => {
  const endpoint = query.from;
  const alias = query.as;

  const aliasForm = alias ? ` as ${alias}` : '';
  return `from ${endpoint}${aliasForm}`;
};

const filtersFormToString = query => {
  const withFilters = query.with;

  if (isNil(withFilters) || isEmpty(withFilters)) {
    return '';
  }

  const filterKey = filter => filter[0];
  const filterValue = filter => filter[1];

  const filters = zip(Object.keys(withFilters), Object.values(withFilters)).map(
    filter => `${filterKey(filter)} = "${filterValue(filter)}"`
  );

  return `\nwith ${filters.join(',')}`;
};

export default queryBuilder;
