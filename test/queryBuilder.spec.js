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

      expect(restQlquery).toBe('from heroes as hero\nwith name = "Link", color = "green"');
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
        'from heroes as hero\nheaders Authorization = "Basic user:pass", Accept = "application/json"'
      );
    });

    it('should get query with timeout defined by the given value', () => {
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

    it('should get the query with returning fields defined by the only form', () => {
      const query = {
        from: 'heroes',
        as: 'hero',
        with: {
          name: 'Link'
        },
        only: ['name', 'clothe']
      };

      const restQlQuery = queryBuilder(query).toQueryString();

      expect(restQlQuery).toEqual('from heroes as hero\nwith name = "Link"\nonly name, clothe');
    });

    it('should get the query with hidden defined', () => {
      const query = {
        from: 'heroes',
        as: 'hero',
        with: {
          name: 'Link'
        },
        hidden: true
      };

      const restQlQuery = queryBuilder(query).toQueryString();

      expect(restQlQuery).toBe('from heroes as hero\nwith name = "Link"\nhidden');
    });

    it('should get the query defined to ignore errors', () => {
      const query = {
        from: 'heroes',
        as: 'hero',
        with: {
          name: 'Link'
        },
        ignoreErrors: true
      };

      const restQlQuery = queryBuilder(query).toQueryString();

      expect(restQlQuery).toBe('from heroes as hero\nwith name = "Link"\nignore-errors');
    });

    it('should get the query with modifier defined', () => {
      const query = {
        modifiers: {
          'cache-control': 600
        },
        from: 'heroes',
        as: 'hero',
        with: {
          name: 'Link'
        }
      };

      const restQlquery = queryBuilder(query).toQueryString();

      expect(restQlquery).toBe('use cache-control = 600\nfrom heroes as hero\nwith name = "Link"');
    });

    it('should get the query with values porperly set for each type', () => {
      const query = {
        from: 'heroes',
        as: 'hero',
        headers: {
          Accept: 'application/json'
        },
        with: {
          name: 'Link',
          age: 10,
          using: ['sword', 'shield'],
          stats: { health: 100 },
          honored: true
        }
      };

      const restQlquery = queryBuilder(query).toQueryString();

      expect(restQlquery).toBe(
        'from heroes as hero\nheaders Accept = "application/json"\nwith name = "Link", age = 10, using = ["sword","shield"], stats = {health: 100}, honored = true'
      );
    });
  });
});
