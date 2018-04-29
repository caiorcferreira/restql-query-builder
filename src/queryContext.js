import { setTargetAsContextInstance, getContextFromTarget, bindContext } from './context';

export const QUERY_CONTEXT_KEYS = {
  FROM: 'FROM',
  AS: 'AS',
  WITH: 'WITH',
  ONLY: 'ONLY',
  HIDDEN: 'HIDDEN',
  IGNORE_ERRORS: 'IGNORE_ERRORS',
  APPLY: 'APPLY'
};

export const bindFromContext = bindContext(QUERY_CONTEXT_KEYS.FROM);
export const bindAsContext = bindContext(QUERY_CONTEXT_KEYS.AS);
export const bindWithContext = bindContext(QUERY_CONTEXT_KEYS.WITH);
export const bindOnlyContext = bindContext(QUERY_CONTEXT_KEYS.ONLY);
export const bindHiddenContext = bindContext(QUERY_CONTEXT_KEYS.HIDDEN);
export const bindIgnoreErrorsContext = bindContext(QUERY_CONTEXT_KEYS.IGNORE_ERRORS);
export const bindApplyContext = bindContext(QUERY_CONTEXT_KEYS.APPLY);

export const getQueryContext = getContextFromTarget;
export const initQueryContext = setTargetAsContextInstance;
