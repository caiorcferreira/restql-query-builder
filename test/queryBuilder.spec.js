import { compose, flatten } from 'ramda';

import { andThen } from '../src/builder';

import {
  queryBuilder,
  createFromBlock,
  createAsBlock,
  createTimeoutBlock,
  createHeaderBlock,
  createWithBlock,
  createHiddenBlock,
  createOnlyBlock,
  createIgnoreErrorsBlock,
  createModifiersBlock,
  applyOperator
} from '../src/queryBuilder';

describe('Query Builder', () => {
  describe('Chainable Way', () => {
    it('should create a simple query object to target a resource with an alias', () => {
      const fromBlock = createFromBlock('heroes');

      const heroQuery = queryBuilder(fromBlock)
        .as('hero')
        .with('weapons', ['sword', 'shield'])
        .apply('flatten');

      expect(heroQuery.toObject()).toEqual({
        from: 'heroes',
        as: 'hero',
        with: { weapons: ['sword', 'shield'] },
        apply: { with: { weapons: 'flatten' } }
      });
    });

    it('should accept an empty object as initial query as default', () => {
      const heroQuery = queryBuilder()
        .from('heroes')
        .as('hero');

      expect(heroQuery.toObject()).toEqual({
        from: 'heroes',
        as: 'hero'
      });
    });

    it('should get the string form of the query', () => {
      const heroQuery = queryBuilder()
        .from('heroes')
        .as('hero');

      expect(heroQuery.toString()).toBe('from heroes as hero');
    });

    it('should get a chainable query builder for the given initial builder', () => {
      const initialBuilder = createFromBlock('heroes');

      const query = queryBuilder(initialBuilder);

      expect(query).toEqual({
        use: expect.any(Function),
        from: expect.any(Function),
        as: expect.any(Function),
        timeout: expect.any(Function),
        headers: expect.any(Function),
        with: expect.any(Function),
        only: expect.any(Function),
        hidden: expect.any(Function),
        ignoreErrors: expect.any(Function),
        apply: expect.any(Function),
        toObject: expect.any(Function),
        toString: expect.any(Function)
      });
    });
  });

  describe('Apply combinator', () => {
    it('should get a new builder with the apply operator targeting a with block', () => {
      const fromBlock = createFromBlock('heroes');
      const asBlock = createAsBlock('hero');
      const withBlock = createWithBlock('weapons', ['sword', 'shield']);

      const initialBuilder = andThen(Array.of, fromBlock, asBlock, withBlock);
      const query = applyOperator(compose(flatten, Array.of), initialBuilder, 'flatten');

      expect(query()).toEqual([
        { from: 'heroes' },
        { as: 'hero' },
        { with: { weapons: ['sword', 'shield'] } },
        { apply: { with: { weapons: 'flatten' } } }
      ]);
    });

    it('should get a new builder with the apply operator targeting an only block', () => {
      const heroQuery = queryBuilder()
        .from('heroes')
        .as('hero')
        .only('name')
        .apply('matches("^Super")')
        .only(['weapons', 'stats']);

      expect(heroQuery.toString()).toEqual(
        'from heroes as hero\nonly name -> matches("^Super"), weapons, stats'
      );
    });
  });

  describe('Block creators', () => {
    it('should create from block', () => {
      const resource = 'heroes';
      const fromBlock = createFromBlock(resource);

      expect(fromBlock()).toEqual({ from: 'heroes' });
    });

    it('should create as block', () => {
      const resourceAlias = 'hero';
      const asBlock = createAsBlock(resourceAlias);

      expect(asBlock()).toEqual({ as: 'hero' });
    });

    it('should create timeout block', () => {
      const timeoutValue = 200;
      const timeoutBlock = createTimeoutBlock(timeoutValue);

      expect(timeoutBlock()).toEqual({ timeout: 200 });
    });

    it('should create header block', () => {
      const headers = [['Accept', 'application/json'], ['Authorization', 'Basic user:pass']];

      const headerBlock = createHeaderBlock(headers);

      expect(headerBlock()).toEqual({
        headers: { Accept: 'application/json', Authorization: 'Basic user:pass' }
      });
    });

    it('should create with block', () => {
      const paramName = 'name';
      const paramValue = 'Link';
      const withBlock = createWithBlock(paramName, paramValue);

      expect(withBlock()).toEqual({ with: { name: 'Link' } });
    });

    it('should create only block', () => {
      const onlyBlock = createOnlyBlock('name');

      expect(onlyBlock()).toEqual({ only: ['name'] });
    });

    it('should create hidden block', () => {
      const shouldBeHidden = true;

      const hiddenBlock = createHiddenBlock(shouldBeHidden);

      expect(hiddenBlock()).toEqual({ hidden: true });
    });

    it('should create ignore errors block', () => {
      const shouldIgnoreErrors = true;

      const ignoreErrorsBlock = createIgnoreErrorsBlock(shouldIgnoreErrors);

      expect(ignoreErrorsBlock()).toEqual({ ignoreErrors: true });
    });

    it('should create modifiers block', () => {
      const modifiers = [['use-cache', 600]];

      const modifiersBlock = createModifiersBlock(modifiers);

      expect(modifiersBlock()).toEqual({ modifiers: { 'use-cache': 600 } });
    });
  });
});
