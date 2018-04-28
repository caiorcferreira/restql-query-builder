import { compose, assoc, map } from 'ramda';
import {
  bindContext,
  copyMetadata,
  getContextFromTarget,
  setContext,
  setTargetAsContextInstance
} from '../src/context';

describe('Query building context', () => {
  describe('get and set context', () => {
    const getMetadata = obj =>
      compose(map(key => Reflect.getOwnMetadata(key, obj)), Reflect.getOwnMetadataKeys)(obj);

    it('should get the context from a query', () => {
      const target = {};
      Reflect.defineMetadata('1', { key: 'FROM', context: ['heroes'] }, target);

      const context = getContextFromTarget(target);

      expect(context).toContainEqual({ key: 'FROM', context: ['heroes'] });
    });

    it('should set context for the given form', () => {
      const target = {};

      const result = setContext('FROM', 'heroes', target);

      const context = getMetadata(result);

      expect(context).toContainEqual({ key: 'FROM', params: ['heroes'] });
    });

    it('should set context for repetitive form', () => {
      const target = {};

      const result = compose(
        setContext('WITH', ['health', 100]),
        setContext('WITH', ['name', 'Link'])
      )(target);

      const context = getMetadata(result);

      expect(context).toContainEqual({ key: 'WITH', params: ['name', 'Link'] });
      expect(context).toContainEqual({ key: 'WITH', params: ['health', 100] });
    });
  });

  it('should copy context metadata from an origin to a target', () => {
    const target = {};
    const origin = {
      from: 'heroes',
      as: 'hero'
    };
    Reflect.defineMetadata('FROM', 'heroes', origin);
    Reflect.defineMetadata('AS', 'hero', origin);

    const updatedTarget = copyMetadata(origin, target);

    const metadataKeys = Reflect.getOwnMetadataKeys(updatedTarget);

    expect(metadataKeys).toEqual(['FROM', 'AS']);
  });

  describe('bindContext', () => {
    it('should create a function that set the evaluator result as a context instance if there is none context instance in the evalatour parameters', () => {
      const target = {};
      const evaluator = assoc('aKey', 'aValue');
      const contextAwareEvaluator = bindContext('EVALUATING', evaluator);

      const evaluatedTarget = contextAwareEvaluator(target);
      const targetContextKeys = Reflect.getOwnMetadataKeys(evaluatedTarget);

      expect(targetContextKeys).toContain('CONTEXT_INSTANCE');
    });

    it('should create a function that bound the evaluator parameters to a given context key in the resulting query', () => {
      const target = setTargetAsContextInstance({});
      const evaluator = assoc('aKey', 'aValue');
      const contextAwareEvaluator = bindContext('A_KEY', evaluator);

      const result = contextAwareEvaluator(target);
      const resultContext = getContextFromTarget(result);

      expect(resultContext).toContainEqual({ key: 'A_KEY', params: [] });
    });

    it('should create a function that bound the evaluator parameters, except the context instance, to a given context key in the resulting query', () => {
      const target = setTargetAsContextInstance({});
      const evaluator = assoc('aKey');
      const contextAwareEvaluator = bindContext('A_KEY', evaluator);

      const result = contextAwareEvaluator('aValue', target);
      const resultContext = getContextFromTarget(result);

      expect(resultContext).toContainEqual({ key: 'A_KEY', params: ['aValue'] });
    });

    it('should create a function that preverse the context from the original target', () => {
      const target = {};
      const evaluator = assoc('from');
      const contextAwareEvaluator = bindContext('FROM', evaluator);

      const result = contextAwareEvaluator('heroes', target);
      const resultContext = getContextFromTarget(result);

      expect(resultContext).toContainEqual({ key: 'FROM', params: ['heroes', {}] });
    });
  });
});
