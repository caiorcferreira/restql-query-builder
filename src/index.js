import 'babel-polyfill';
import { isEmpty, isNil, propOr, toPairs } from 'ramda';

const queryBuilder = (query = {}) => ({
  toQueryString: toQueryString(query)
});

const toQueryString = query => () => {
  return `${endpointFormToString(query)}${headersFormToString(query)}${timeoutFormToString(
    query
  )}${filtersFormToString(query)}${onlyFormToString(query)}${hiddenFormToString(
    query
  )}${ignoreErrorsFormToString(query)}`;
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

  const headerForm = toPairs(headers)
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

  const filtersForm = toPairs(filters)
    .map(filter => `${filterKey(filter)} = "${filterValue(filter)}"`)
    .join(',');

  return `\nwith ${filtersForm}`;
};

const onlyFormToString = query => {
  const fields = propOr([], 'only', query);

  if (isEmpty(fields)) {
    return '';
  }

  const onlyForm = fields.join(', ');

  return `\nonly ${onlyForm}`;
};

const hiddenFormToString = query => {
  const isHidden = propOr(false, 'hidden', query);

  if (isHidden) {
    return `\nhidden`;
  } else {
    return '';
  }
};

const ignoreErrorsFormToString = query => {
  const hasIgnoreErros = propOr(false, 'ignoreErrors', query);

  if (hasIgnoreErros) {
    return '\nignore-errors';
  } else {
    return '';
  }
};

export default queryBuilder;
