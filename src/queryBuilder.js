import 'babel-polyfill';
import stringify from './stringify';

const queryBuilder = (query = {}) => ({
  toQueryString: () => stringify(query)
});

export default queryBuilder;
