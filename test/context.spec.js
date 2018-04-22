import { clone } from 'ramda';
import { context, copyMetadata, getContextFromQuery, setContext } from '../src/context';

describe('Query building context', () => {
  it('should copy context metadata from an query to a new one', () => {
    const query = {
      from: 'heroes',
      as: 'hero'
    };
    Reflect.defineMetadata('FROM', 'heroes', query);
    Reflect.defineMetadata('AS', 'hero', query);

    const otherQuery = copyMetadata(query, {});

    const metadataKeys = Reflect.getOwnMetadataKeys(otherQuery);

    expect(metadataKeys).toEqual(['FROM', 'AS']);
  });

  it('should create a function from another that preserve the context', () => {
    const query = {
      from: 'heroes',
      as: 'hero'
    };
    Reflect.defineMetadata('FROM', 'heroes', query);
    Reflect.defineMetadata('AS', 'hero', query);
    const cloneContextAware = context(clone);

    const otherQuery = cloneContextAware(query)();
    const metadataKeys = Reflect.getOwnMetadataKeys(otherQuery);

    expect(metadataKeys).toEqual(['FROM', 'AS']);
  });

  it('should get the context from a query', () => {
    const query = {
      from: 'heroes',
      as: 'hero'
    };
    Reflect.defineMetadata('FROM', ['heroes'], query);
    Reflect.defineMetadata('AS', ['hero'], query);

    const context = getContextFromQuery(query);

    expect(context).toEqual([
      { form: 'FROM', params: ['heroes'] },
      { form: 'AS', params: ['hero'] }
    ]);
  });

  it('should set context for the given form', () => {
    const query = {
      from: 'heroes'
    };

    const updatedQuery = setContext('FROM', 'heroes', query);

    const context = getContextFromQuery(updatedQuery);

    expect(context).toEqual([{ form: 'FROM', params: ['heroes'] }]);
  });
});
