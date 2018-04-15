import 'babel-polyfill';
import { isEmpty, isNil, propOr, toPairs, type } from 'ramda';

const queryBuilder = (query = {}) => ({
  toQueryString: toQueryString(query)
});

const toQueryString = query => () => {
  return `${modifierFormToString(query)}${endpointFormToString(query)}${headersFormToString(
    query
  )}${timeoutFormToString(query)}${filtersFormToString(query)}${onlyFormToString(
    query
  )}${hiddenFormToString(query)}${ignoreErrorsFormToString(query)}`;
};

const modifierFormToString = query => {
  const modifiers = propOr({}, 'modifiers', query);

  if (isEmpty(modifiers)) {
    return '';
  }

  const modifiersForm = toPairs(modifiers)
    .map(formatParameter)
    .join(', ');

  return `use ${modifiersForm}\n`;
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

  const headerForm = toPairs(headers)
    .map(formatParameter)
    .join(', ');

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

  const filtersForm = toPairs(filters)
    .map(formatParameter)
    .join(', ');

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

const formatParameter = ([key, value]) => `${key} = ${formatParameterValueByType(value)}`;

const formatParameterValueByType = parameter => {
  const parameterType = type(parameter);
  const stringify = obj =>
    toPairs(obj).reduce((acc, [key, value]) => `${key}: ${formatParameterValueByType(value)}`, '');

  switch (parameterType) {
    case 'String':
      return `"${parameter}"`;
    case 'Object':
      return `{${stringify(parameter)}}`;
    case 'Array':
      return JSON.stringify(parameter);
    default:
      return `${parameter}`;
  }
};

export default queryBuilder;
