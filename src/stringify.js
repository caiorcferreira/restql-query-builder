import {
  compose,
  map,
  isEmpty,
  isNil,
  propOr,
  toPairs,
  is,
  converge,
  join,
  not,
  always,
  identity,
  cond,
  defaultTo,
  props,
  zip,
  equals,
  call,
  head,
  last,
  pathOr,
  curry,
  into
} from 'ramda';

const returnValue = always;

const isReferenceType = cond([
  [is(String), value => value.match(/(\w+)\.(\w+)/)],
  [always(true), returnValue(false)]
]);

const formatObject = curry((valueFormater, object) => {
  return compose(
    objectAsString => `{${objectAsString}}`,
    join(','),
    map(([key, value]) => `${key}: ${valueFormater(value)}`),
    toPairs
  )(object);
});
const formatArray = JSON.stringify;
const formatString = value => `"${value}"`;
const formatDefaultValue = value => `${value}`;
const formatReferenceType = formatDefaultValue;

function formatValueByType(value) {
  return cond([
    [isReferenceType, formatReferenceType],
    [is(String), formatString],
    [is(Array), formatArray],
    [is(Object), formatObject(formatValueByType)],
    [always(true), formatDefaultValue]
  ])(value);
}

const formatKeyValuePair = ([key, value]) => `${key} = ${formatValueByType(value)}`;

// ignoreErrorsFormToString :: Query => String
const ignoreErrorsFormToString = compose(
  cond([[equals(false), returnValue('')], [always(true), () => `\nignore-errors`]]),
  propOr(false, 'ignoreErrors')
);

// hiddenFormToString :: Query => String
const hiddenFormToString = compose(
  cond([[equals(false), returnValue('')], [always(true), () => `\nhidden`]]),
  propOr(false, 'hidden')
);

// applyOperatorToString :: Map<String, String> => Parameter<String[]> => String
const applyOperatorToString = curry((applyMap, parameterKey) => {
  return compose(
    cond([[isEmpty, identity], [always(true), applyString => ` -> ${applyString}`]]),
    propOr('', parameterKey)
  )(applyMap);
});

// formatOnlyFilters :: Map<String, String> => Filter<String> => String[]
const formatOnlyFilters = curry(function(applyMap, onlyFilter) {
  return compose(
    join(''),
    into([onlyFilter], identity),
    applyOperatorToString(applyMap)
  )(onlyFilter);
});

// onlyFormToString :: Query => String
function onlyFormToString(query) {
  const applyMap = pathOr({}, ['apply', 'only'], query);

  return compose(
    cond([[isEmpty, returnValue('')], [always(true), onlyForm => `\nonly ${onlyForm}`]]),
    join(', '),
    map(formatOnlyFilters(applyMap)),
    propOr([], 'only')
  )(query);
}

// parameterKey :: Parameter<String[]> => String
const parameterKey = head;

// formatWithClauses :: Map<String, String> => Parameter<String[]> => String[]
const formatWithClauses = applyMap =>
  converge(compose(join(''), Array.of), [
    formatKeyValuePair,
    compose(applyOperatorToString(applyMap), parameterKey)
  ]);

// withFormToString :: Query => String
const withFormToString = query => {
  const applyMap = pathOr({}, ['apply', 'with'])(query);

  return compose(
    cond([[isEmpty, returnValue('')], [always(true), withForm => `\nwith ${withForm}`]]),
    join(', '),
    map(formatWithClauses(applyMap)),
    toPairs,
    propOr({}, 'with')
  )(query);
};

// timeoutFormToString :: Query => String
const timeoutFormToString = compose(
  cond([[isNil, returnValue('')], [always(true), timeout => `\ntimeout = ${timeout}`]]),
  propOr(null, 'timeout')
);

// headersFormToString :: Query => String
const headersFormToString = compose(
  cond([[isEmpty, returnValue('')], [always(true), headersForm => `\nheaders ${headersForm}`]]),
  join(', '),
  map(formatKeyValuePair),
  toPairs,
  propOr({}, 'headers')
);

// fromFormToString :: Query => String
const fromFormToString = compose(
  join(''),
  compose(
    map(converge(call, [head, last])),
    zip([endpoint => (endpoint ? `from ${endpoint}` : ''), alias => (alias ? ` as ${alias}` : '')])
  ),
  props(['from', 'as'])
);

// modifierFormToString :: Query => String
const modifierFormToString = compose(
  cond([[isEmpty, returnValue('')], [always(true), modifiersForm => `use ${modifiersForm}\n`]]),
  join(', '),
  map(formatKeyValuePair),
  toPairs,
  propOr({}, 'modifiers')
);

// stringifyQuery :: Query => String
const stringifyQuery = converge(compose(join(''), Array.of), [
  modifierFormToString,
  fromFormToString,
  headersFormToString,
  timeoutFormToString,
  withFormToString,
  onlyFormToString,
  hiddenFormToString,
  ignoreErrorsFormToString
]);

// stringify :: Query => String
const stringify = compose(
  join('\n\n'),
  map(stringifyQuery),
  cond([[compose(not, is(Array)), Array.of], [always(true), identity]]),
  defaultTo([])
);

export { fromFormToString, withFormToString };

export default stringify;
