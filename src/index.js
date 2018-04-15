import 'babel-polyfill';
import { zip, isEmpty, isNil, propOr } from 'ramda';

const queryBuilder = (query = {}) => ({
  toQueryString: toQueryString(query)
});

const toQueryString = query => () => {
  return `${endpointFormToString(query)}${headersFormToString(query)}${timeoutFormToString(
    query
  )}${filtersFormToString(query)}`;
};

const endpointFormToString = query => {
  const endpoint = query.from;
  const alias = query.as;

  const boundingForm = alias ? ` as ${alias}` : '';
  return `from ${endpoint}${boundingForm}`;
};

const headersFormToString = query => {
  const headers = propOr({}, 'headers', query);

  if (isEmpty(headers)) {
    return '';
  }

  const headerKey = header => header[0];
  const headerValue = header => header[1];

  const headerForm = zip(Object.keys(headers), Object.values(headers))
    .map(header => `${headerKey(header)} = "${headerValue(header)}"`)
    .join(',');

  return `\nheaders ${headerForm}`;
};

const timeoutFormToString = query => {
  const timeout = propOr(null, 'timeout', query);

  if (isNil(timeout)) {
    return '';
  }

  return `\ntimeout = ${timeout}`;
};

const filtersFormToString = query => {
  const filters = propOr({}, 'with', query);

  if (isEmpty(filters)) {
    return '';
  }

  const filterKey = filter => filter[0];
  const filterValue = filter => filter[1];

  const filtersForm = zip(Object.keys(filters), Object.values(filters))
    .map(filter => `${filterKey(filter)} = "${filterValue(filter)}"`)
    .join(',');

  return `\nwith ${filtersForm}`;
};

export default queryBuilder;
