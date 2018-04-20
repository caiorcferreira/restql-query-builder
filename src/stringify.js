import {
  compose,
  map,
  isEmpty,
  isNil,
  propOr,
  toPairs,
  is,
  reduce,
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
  curry
} from 'ramda';


const returnValue = always;

const isReferenceType = cond([
  [is(String), value => value.match(/(\w+)\.(\w+)/)],
  [always(true), returnValue(false)]
]);

const formatObject = compose(
  objectAsString => `{${objectAsString}}`,
  reduce((acc, [objKey, objValue]) => `${objKey}: ${formatValueByType(objValue)}`, ''),
  toPairs
);
const formatArray = JSON.stringify;
const formatString = value => (isReferenceType(value) ? `${value}` : `"${value}"`);
const formatReferenceType = value => `${value}`;

const formatValueByType = cond([
  [isReferenceType, formatReferenceType],
  [compose(is(String)), formatString],
  [compose(is(Array)), formatArray],
  [compose(is(Object)), formatObject],
  [always(true), value => `${value}`]
]);

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

// onlyFormToString :: Query => String
const onlyFormToString = compose(
  cond([[isEmpty, returnValue('')], [always(true), onlyForm => `\nonly ${onlyForm}`]]),
  join(', '),
  propOr([], 'only')
);

// applyFunctionFormater :: Map<String, String> => Parameter<String[]> => String
const applyFunctionFormater = curry((applyMap, parameter) => {
  const parameterKey = head;

  return compose(
    cond([
      [isEmpty, identity],
      [always(true), applyString => ` -> ${applyString}`]
    ]),
    propOr('', parameterKey(parameter))
  )(applyMap);
});

// formatWithClauses :: Map<String, String> => Parameter<String[]> => String[]
const formatWithClauses = applyMap =>
  converge(compose(join(''), Array.of), [formatKeyValuePair, applyFunctionFormater(applyMap)]);

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
