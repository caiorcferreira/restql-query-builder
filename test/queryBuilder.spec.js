import queryBuilder from '../src/queryBuilder';
import { getContextFromQuery } from '../src/context';

describe('RestQL query builder', () => {
  it('should get an empty string when no query is provided', () => {
    const restQlQuery = queryBuilder().toQueryString();

    expect(restQlQuery).toBe('');
  });

  it('should get the string form of a query', () => {
    const query = {
      from: 'heroes',
      as: 'hero',
      with: {
        name: 'Link',
        money: 100
      },
      only: ['name'],
      ignoreErrors: true
    };

    const restQlQuery = queryBuilder(query).toQueryString();

    expect(restQlQuery).toBe(
      'from heroes as hero\nwith name = "Link", money = 100\nonly name\nignore-errors'
    );
  });

  it('should get query map for the given settings', () => {
    const initialQuery = {
      from: 'heroes',
      as: 'hero'
    };

    const query = queryBuilder(initialQuery).toQueryMap();

    expect(query).toEqual(initialQuery);
  });

  it('should get a query for the given endpoint', () => {
    const builder = queryBuilder().from('heroes');

    expect(builder.toQueryMap()).toEqual({
      from: 'heroes'
    });
  });

  it('should get a query for the given endpoint binded to the given alias', () => {
    const builder = queryBuilder()
      .from('heroes')
      .as('hero');

    expect(builder.toQueryMap()).toEqual({
      from: 'heroes',
      as: 'hero'
    });
  });

  it('should get a query for the given with clauses', () => {
    const builder = queryBuilder()
      .from('heroes')
      .as('hero')
      .with('name', 'Link')
      .with('level', 10);

    expect(builder.toQueryMap()).toEqual({
      from: 'heroes',
      as: 'hero',
      with: {
        name: 'Link',
        level: 10
      }
    });
  });

  it('should get a query for the given only filters', () => {
    const builder = queryBuilder()
      .from('heroes')
      .as('hero')
      .only('name', 'level');

    expect(builder.toQueryMap()).toEqual({
      from: 'heroes',
      as: 'hero',
      only: ['name', 'level']
    });
  });

  it('should get a query for the given headers', () => {
    const builder = queryBuilder()
      .from('heroes')
      .as('hero')
      .headers(['Accept', 'application/json'], ['Authorization', 'Basic user:pass']);

    expect(builder.toQueryMap()).toEqual({
      from: 'heroes',
      as: 'hero',
      headers: {
        Accept: 'application/json',
        Authorization: 'Basic user:pass'
      }
    });
  });

  it('should get a query with the given timeout', () => {
    const builder = queryBuilder()
      .from('heroes')
      .as('hero')
      .timeout(500);

    expect(builder.toQueryMap()).toEqual({
      from: 'heroes',
      as: 'hero',
      timeout: 500
    });
  });

  it('should get a query with hidden set', () => {
    const builder = queryBuilder()
      .from('heroes')
      .as('hero')
      .with('name', 'Link')
      .hidden();

    expect(builder.toQueryMap()).toEqual({
      from: 'heroes',
      as: 'hero',
      with: {
        name: 'Link'
      },
      hidden: true
    });
  });

  it('should get a query with ignore errors set', () => {
    const builder = queryBuilder()
      .from('heroes')
      .as('hero')
      .ignoreErrors();

    expect(builder.toQueryMap()).toEqual({
      from: 'heroes',
      as: 'hero',
      ignoreErrors: true
    });
  });

  it('should get a query with the given modifiers', () => {
    const builder = queryBuilder()
      .modifiers(['use-cache', 600])
      .from('heroes')
      .as('hero');

    expect(builder.toQueryMap()).toEqual({
      modifiers: {
        'use-cache': 600
      },
      from: 'heroes',
      as: 'hero'
    });
  });

  it('should get a multiendpoint query', () => {
    const heroQuery = queryBuilder()
      .from('heroes')
      .as('hero')
      .with('name', 'Link')
      .toQueryMap();

    const weaponQuery = queryBuilder()
      .from('weapons')
      .as('weapon')
      .with('heroId', 'hero.id')
      .toQueryMap();

    const query = queryBuilder(heroQuery).concat(weaponQuery);

    expect(query).toEqual([
      {
        from: 'heroes',
        as: 'hero',
        with: {
          name: 'Link'
        }
      },
      {
        from: 'weapons',
        as: 'weapon',
        with: {
          heroId: 'hero.id'
        }
      }
    ]);
  });

  it('should get a query with the given functions applied', () => {
    const builder = queryBuilder()
      .from('heroes')
      .as('hero')
      .with('using', ['sword', 'shield'])
      .apply('flatten')
      .only('name')
      .apply('matches(^Super)');

    expect(builder.toQueryMap()).toEqual({
      from: 'heroes',
      as: 'hero',
      with: {
        using: ['sword', 'shield']
      },
      only: ['name'],
      apply: {
        with: {
          using: 'flatten'
        },
        only: {
          name: 'matches(^Super)'
        }
      }
    });
  });

  it('should get the complete query context', () => {
    const query = queryBuilder()
      .from('heroes')
      .toQueryMap();

    const queryContext = getContextFromQuery(query);

    expect(queryContext).toEqual([{ form: 'FROM', params: ['heroes'] }]);
  });
});
