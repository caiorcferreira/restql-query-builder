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

    it('should get a query for a given endpoint bound to the given alias', () => {
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
          name: 'Link',
          color: 'green'
        }
      };

      const restQlquery = queryBuilder(query).toQueryString();

      expect(restQlquery).toBe('from heroes as hero\nwith name = "Link",color = "green"');
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

    it('should get query with headers define', () => {
      const query = {
        from: 'heroes',
        as: 'hero',
        headers: {
          Authorization: 'Basic user:pass',
          Accept: 'application/json'
        }
      };

      const restQlQuery = queryBuilder(query).toQueryString();

      expect(restQlQuery).toBe(
        'from heroes as hero\nheaders Authorization = "Basic user:pass",Accept = "application/json"'
      );
    });

    it('should get query with timeout deifned by the given value', () => {
      const query = {
        from: 'heroes',
        as: 'hero',
        headers: {
          Accept: 'application/json'
        },
        timeout: 200,
        with: {
          name: 'Link'
        }
      };

      const restQlQuery = queryBuilder(query).toQueryString();

      expect(restQlQuery).toBe(
        'from heroes as hero\nheaders Accept = "application/json"\ntimeout = 200\nwith name = "Link"'
      );
    });
  });
});
