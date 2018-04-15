import queryBuilder from '../src';

describe('RestQL query builder', () => {
  describe('transform a query object into a string', () => {
    it('should get a query for a given endpoint', () => {
      const query = {
        from: 'heroes'
      };

      const restQlQuery = queryBuilder(query).toQueryString();

      expect(restQlQuery).toBe('from heroes');
    });

    it('should get a query for a given endpoint with the given alias', () => {
      const query = {
        from: 'heroes',
        as: 'hero'
      };

      const restQlQuery = queryBuilder(query).toQueryString();

      expect(restQlQuery).toBe('from heroes as hero');
    });

    it('should get a query for the given filter', () => {
      const query = {
        from: 'heroes',
        as: 'hero',
        with: {
          name: 'Link'
        }
      };

      const restQlquery = queryBuilder(query).toQueryString();

      expect(restQlquery).toBe('from heroes as hero\nwith name = "Link"');
    });

    it('should not define filters when with is empty', () => {
      const query = {
        from: 'heroes',
        as: 'hero',
        with: {}
      };

      const restQlQuery = queryBuilder(query).toQueryString();

      expect(restQlQuery).toBe('from heroes as hero');
    });
  });
});
