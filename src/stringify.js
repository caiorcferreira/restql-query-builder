import { isEmpty, isNil, propOr, toPairs, is, type } from 'ramda';

const stringify = query => {
  const queryList = is(Array, query) ? query : [query];

  return queryList.map(stringifyQuery).join('\n\n');
};

const stringifyQuery = query =>
  `${modifierFormToString(query)}${fromFormToString(query)}${headersFormToString(
    query
  )}${timeoutFormToString(query)}${filtersFormToString(query)}${onlyFormToString(
    query
  )}${hiddenFormToString(query)}${ignoreErrorsFormToString(query)}`;

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

const fromFormToString = query => {
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

const formatParameterValueByType = value => {
  const valueType = type(value);

  switch (valueType) {
    case 'String':
      return isReferenceType(value) ? `${value}` : `"${value}"`;
    case 'Object':
      return `{${stringifyObj(value)}}`;
    case 'Array':
      return JSON.stringify(value);
    default:
      return `${value}`;
  }
};

const isReferenceType = value => value.match(/(\w+)\.(\w+)/);

const stringifyObj = obj =>
  toPairs(obj).reduce(
    (acc, [objKey, objValue]) => `${objKey}: ${formatParameterValueByType(objValue)}`,
    ''
  );

export default stringify;
