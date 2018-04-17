import queryBuilder from '../src';

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
});
