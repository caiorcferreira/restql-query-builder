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
  curry,
  tap
} from 'ramda';

const isReferenceType = value => value.match(/(\w+)\.(\w+)/);

const stringifyObj = compose(
  objectAsString => `{${objectAsString}}`,
  reduce((acc, [objKey, objValue]) => `${objKey}: ${formatParameterValueByType(objValue)}`, ''),
  toPairs
);

const formatParameterValueByType = cond([
  [compose(is(String)), value => (isReferenceType(value) ? `${value}` : `"${value}"`)],
  [compose(is(Array)), JSON.stringify],
  [compose(is(Object)), stringifyObj],
  [always(true), value => `${value}`]
]);

const formatParameter = ([key, value]) => `${key} = ${formatParameterValueByType(value)}`;

// ignoreErrorsFormToString :: Query => String
const ignoreErrorsFormToString = compose(
  cond([[equals(false), always('')], [always(true), () => `\nignore-errors`]]),
  propOr(false, 'ignoreErrors')
);

// hiddenFormToString :: Query => String
const hiddenFormToString = compose(
  cond([[equals(false), always('')], [always(true), () => `\nhidden`]]),
  propOr(false, 'hidden')
);

// onlyFormToString :: Query => String
const onlyFormToString = compose(
  cond([[isEmpty, always('')], [always(true), onlyForm => `\nonly ${onlyForm}`]]),
  join(', '),
  propOr([], 'only')
);

const applyFunctionFormater = curry((applyMap, parameter) => {
  const parameterKey = head;

  return compose(
    cond([[compose(not, isEmpty), applyString => ` -> ${applyString}`], [always(true), identity]]),
    propOr('', parameterKey(parameter))
  )(applyMap);
});

const formatWithClauses = applyMap =>
  converge(compose(join(''), Array.of), [formatParameter, applyFunctionFormater(applyMap)]);

// withFormToString :: Query => String
const withFormToString = query => {
  const applyMap = pathOr({}, ['apply', 'with'])(query);

  return compose(
    cond([[isEmpty, always('')], [always(true), withForm => `\nwith ${withForm}`]]),
    join(', '),
    map(formatWithClauses(applyMap)),
    toPairs,
    propOr({}, 'with')
  )(query);
};

// timeoutFormToString :: Query => String
const timeoutFormToString = compose(
  cond([[isNil, always('')], [always(true), timeout => `\ntimeout = ${timeout}`]]),
  propOr(null, 'timeout')
);

// headersFormToString :: Query => String
const headersFormToString = compose(
  cond([[isEmpty, always('')], [always(true), headersForm => `\nheaders ${headersForm}`]]),
  join(', '),
  map(formatParameter),
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
  cond([[isEmpty, always('')], [always(true), modifiersForm => `use ${modifiersForm}\n`]]),
  join(', '),
  map(formatParameter),
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
