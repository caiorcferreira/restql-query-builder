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
  apply,
  hidden,
  ignoreErrors,
  toString,
  toObject
} from '../src/queryBuilder';

describe('Query Builder', () => {
  it('should get the string form of the query from chainable interface', () => {
    const heroQuery = queryBuilder()
      .from('heroes')
      .as('hero');

    expect(heroQuery.toString()).toBe('from heroes as hero');
  });

  it('should get the string form of the query from pointfree interface', () => {
    const heroQuery = compose(
      toString,
      as('hero'),
      from('heroes')
    )();

    expect(heroQuery).toBe('from heroes as hero');
  });

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

    it('should accept an empty object as initial query as default', () => {
      const heroQuery = queryBuilder()
        .from('heroes')
        .as('hero');

      expect(heroQuery.toObject()).toEqual({
        from: 'heroes',
        as: 'hero'
      });
    });

    it('should create a query with any order with query builder interface', () => {
      const chainableHeroQuery = queryBuilder()
        .withClause('name', 'Link')
        .from('heroes')
        .as('hero');

      expect(chainableHeroQuery.toString()).toBe('from heroes as hero\nwith name = "Link"');
    });

    it('should get the object form of a query with from block', () => {
      const heroQuery = queryBuilder().from('heroes');

      expect(heroQuery.toObject()).toEqual({
        from: 'heroes'
      });
    });

    it('should get the object form of a query with as block', () => {
      const heroQuery = queryBuilder()
        .from('heroes')
        .as('hero');

      expect(heroQuery.toObject()).toEqual({
        from: 'heroes',
        as: 'hero'
      });
    });

    it('should get the object form of a query with with block', () => {
      const query = queryBuilder()
        .from('heroes')
        .withClause('name', 'Link');

      expect(query.toObject()).toEqual({ from: 'heroes', with: { name: 'Link' } });
    });

    it('should create a query object with array parameter flattened', () => {
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

    it('should get the object form of a query with timeout block ', () => {
      const query = queryBuilder()
        .from('heroes')
        .timeout(200);

      expect(query.toObject()).toEqual({ from: 'heroes', timeout: 200 });
    });

    it('should get the object form of a query with modifiers block', () => {
      const query = queryBuilder()
        .from('heroes')
        .use([['use-cache', 600]]);

      expect(query.toObject()).toEqual({ modifiers: { 'use-cache': 600 }, from: 'heroes' });
    });

    it('should get the object form of a query with header block', () => {
      const query = queryBuilder()
        .from('heroes')
        .headers({
          'Content-Type': 'application/json'
        });

      expect(query.toObject()).toEqual({
        from: 'heroes',
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should get the object form of a query with only block', () => {
      const query = queryBuilder()
        .from('heroes')
        .only(['name', 'weapons']);

      expect(query.toObject()).toEqual({ from: 'heroes', only: ['name', 'weapons'] });
    });

    it('should get the object form of a query with hidden block', () => {
      const query = queryBuilder()
        .from('heroes')
        .hidden();

      expect(query.toObject()).toEqual({ from: 'heroes', hidden: true });
    });

    it('should get the object form of a query without hidden block', () => {
      const query = queryBuilder()
        .from('heroes')
        .hidden(false);

      expect(query.toObject()).toEqual({ from: 'heroes', hidden: false });
    });

    it('should get the object form of a query with ignore erros block', () => {
      const query = queryBuilder()
        .from('heroes')
        .ignoreErrors();

      expect(query.toObject()).toEqual({ from: 'heroes', ignoreErrors: true });

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

    it('should get the object form of a query without ignore erros block', () => {
      const query = queryBuilder()
        .from('heroes')
        .ignoreErrors(false);

      expect(query.toObject()).toEqual({ from: 'heroes', ignoreErrors: false });
    });
  });

  describe('Pointfree Style', () => {
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

    it('should create a query with any order with pointfree interface', () => {
      const pointfreeHeroQuery = compose(
        from('heroes'),
        as('hero')
      )();

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

    it('should get the object form of a query with from block', () => {
      const query = compose(
        toObject,
        from('heroes')
      )();

      expect(query).toEqual({
        from: 'heroes'
      });
    });

    it('should get the object form of a query with as block', () => {
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

    it('should get the object form of a query with apply operator', () => {
      const query = compose(
        toObject,
        apply('flatten'),
        withClause('weapons', ['sword', 'shield']),
        from('heroes')
      )();

      expect(query).toEqual({
        from: 'heroes',
        with: { weapons: ['sword', 'shield'] },
        apply: { with: { weapons: 'flatten' } }
      });
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

    it('should get the object form of a query with ignore errors block', () => {
      const query = compose(
        toObject,
        ignoreErrors(),
        from('heroes')
      )();

      expect(query).toEqual({ from: 'heroes', ignoreErrors: true });
    });

    it('should get the object form of a query without ignore errors block', () => {
      const query = compose(
        toObject,
        ignoreErrors(false),
        from('heroes')
      )();

      expect(query).toEqual({ from: 'heroes', ignoreErrors: false });
    });
  });
});
