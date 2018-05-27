import { compose, flatten } from 'ramda';

import { andThen } from '../src/builder';
import { createFromBlock, createAsBlock, createWithBlock } from '../src/blockCreators';
import { queryBuilder, applyOperator } from '../src/queryBuilder';

describe('Query Builder', () => {
  describe('Chainable Way', () => {
    it('should create a simple query object to target a resource with an alias', () => {
      const fromBlock = createFromBlock('heroes');

      const heroQuery = queryBuilder(fromBlock)
        .as('hero')
        .with('name', 'Link')
        .with('weapons', ['sword', 'shield'])
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
});
