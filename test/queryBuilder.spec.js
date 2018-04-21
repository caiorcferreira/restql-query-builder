import queryBuilder from '../src/queryBuilder';

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
    const query = queryBuilder().from('heroes');

    expect(query.toQueryMap()).toEqual({
      from: 'heroes'
    });
  });

  it('should get a query for the given endpoint binded to the given alias', () => {
    const query = queryBuilder()
      .from('heroes')
      .as('hero');

    expect(query.toQueryMap()).toEqual({
      from: 'heroes',
      as: 'hero'
    });
  });

  it('should get a query for the given with clauses', () => {
    const query = queryBuilder()
      .from('heroes')
      .as('hero')
      .with('name', 'Link')
      .with('level', 10);

    expect(query.toQueryMap()).toEqual({
      from: 'heroes',
      as: 'hero',
      with: {
        name: 'Link',
        level: 10
      }
    });
  });

  it('should get a query for the given only filters', () => {
    const query = queryBuilder()
      .from('heroes')
      .as('hero')
      .only('name', 'level');

    expect(query.toQueryMap()).toEqual({
      from: 'heroes',
      as: 'hero',
      only: ['name', 'level']
    });
  });
});
