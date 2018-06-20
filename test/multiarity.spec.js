import { partial, apply } from 'ramda';
import multiarity from '../src/multiarity';

describe('Multimethod', () => {
  it('create a multi arity function from the object definition', () => {
    const add = (a, b) => a + b;

    const multiAdd = multiarity({
      1: partial(add),
      2: apply(add)
    });

    const inc = multiAdd(1);

    expect(inc(1)).toBe(2);
  });

  it('create a multi arity function, with default case, from object definition', () => {
    const add = (a, b) => a + b;

    const multiAdd = multiarity({
      1: partial(add),
      n: apply(add)
    });

    expect(multiAdd(1, 1)).toBe(2);
  });
});
