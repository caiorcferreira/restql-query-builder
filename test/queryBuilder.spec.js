import { compose, flatten } from 'ramda';

import { andThen } from '../src/builder';
import { createFromBlock, createAsBlock, createWithBlock } from '../src/blockCreators';

import {
  applyOperator,
  queryBuilder,
  use,
  from,
  as,
  timeout,
  headers,
  withClause,
  only,
  hidden,
  ignoreErrors,
  toString,
  toObject
} from '../src/queryBuilder';

describe('Query Builder', () => {
  describe('Apply combinator', () => {
    it('should get a new builder with the apply operator targeting a with block', () => {
      const fromBlock = createFromBlock('heroes');
      const asBlock = createAsBlock('hero');
      const withBlock = createWithBlock('weapons', ['sword', 'shield']);

      const initialBuilder = andThen(Array.of, fromBlock, asBlock, withBlock);
      const query = applyOperator(
        compose(
          flatten,
          Array.of
        ),
        initialBuilder,
        'flatten'
      );

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

  describe('Chainable Style', () => {
    it('should create a simple query object to target a resource with an alias', () => {
      const fromBlock = createFromBlock('heroes');

      const heroQuery = queryBuilder(fromBlock)
        .as('hero')
        .withClause('name', 'Link')
        .withClause('weapons', ['sword', 'shield'])
        .apply('flatten');

      expect(heroQuery.toObject()).toEqual({
        from: 'heroes',
        as: 'hero',
        with: { weapons: ['sword', 'shield'], name: 'Link' },
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
        withClause: expect.any(Function),
        only: expect.any(Function),
        hidden: expect.any(Function),
        ignoreErrors: expect.any(Function),
        apply: expect.any(Function),
        toObject: expect.any(Function),
        toString: expect.any(Function)
      });
    });

    it('should create a query with any order', () => {
      const chainableHeroQuery = queryBuilder()
        .withClause('name', 'Link')
        .from('heroes')
        .as('hero');

      const pointfreeHeroQuery = compose(
        from('heroes'),
        as('hero')
      )();

      expect(chainableHeroQuery.toString()).toBe('from heroes as hero\nwith name = "Link"');

      expect(toString(pointfreeHeroQuery)).toBe('from heroes as hero');

      const withName = withClause('name');
      const withHeroName = withName('Link');

      const query = compose(
        from('heroes'),
        withHeroName,
        ignoreErrors()
      )();

      expect(toString(query)).toBe('from heroes\nwith name = "Link"\nignore-errors');
    });
  });

  describe('Pointless Style', () => {
    it('should get the string of a complete query', () => {
      const query = compose(
        toString,
        as('hero'),
        from('heroes')
      )();

      expect(query).toBe('from heroes as hero');
    });

    it('should get the string of a complete query with empty input', () => {
      const query = compose(
        toString,
        as('hero'),
        from('heroes')
      )();

      expect(query).toBe('from heroes as hero');
    });

    it('should get the object form of a query with from and as blocks', () => {
      const query = compose(
        toObject,
        as('hero'),
        from('heroes')
      )();

      expect(query).toEqual({
        from: 'heroes',
        as: 'hero'
      });
    });

    it('should get the object form of a query with timeout block ', () => {
      const query = compose(
        toObject,
        timeout(200),
        as('hero'),
        from('heroes')
      )();
      expect(query).toEqual({ from: 'heroes', as: 'hero', timeout: 200 });
    });

    it('should get the object form of a query with modifiers block', () => {
      const query = compose(
        toObject,
        use([['use-cache', 600]]),
        from('heroes')
      )();
      expect(query).toEqual({ modifiers: { 'use-cache': 600 }, from: 'heroes' });
    });

    it('should get the object form of a query with header block', () => {
      const query = compose(
        toObject,
        headers([['Content-Type', 'application/json']]),
        from('heroes')
      )();
      expect(query).toEqual({ from: 'heroes', headers: { 'Content-Type': 'application/json' } });
    });

    it('should get the object form of a query with with block', () => {
      const query = compose(
        toObject,
        withClause('name', 'Link'),
        from('heroes')
      )();
      expect(query).toEqual({ from: 'heroes', with: { name: 'Link' } });
    });

    it('should get the object form of a query with only block', () => {
      const query = compose(
        toObject,
        only(['name', 'weapons']),
        from('heroes')
      )();
      expect(query).toEqual({ from: 'heroes', only: ['name', 'weapons'] });
    });

    it('should get the object form of a query with hidden block', () => {
      const query = compose(
        toObject,
        hidden(),
        from('heroes')
      )();

      expect(query).toEqual({ from: 'heroes', hidden: true });
    });

    it('should get the object form of a query with ignore erros block', () => {
      const query = compose(
        toObject,
        ignoreErrors(),
        as('hero'),
        from('heroes')
      )();
      expect(query).toEqual({ from: 'heroes', as: 'hero', ignoreErrors: true });

      const query2 = compose(
        toObject,
        ignoreErrors(false),
        as('hero'),
        from('heroes')
      )();
      expect(query2).toEqual({ from: 'heroes', as: 'hero', ignoreErrors: false });

      const query3 = ignoreErrors(true, from('heroes', {}));
      expect(toObject(query3)).toEqual({ from: 'heroes', ignoreErrors: true });
    });
  });
});
