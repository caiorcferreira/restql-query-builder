// Builder<T> = Builder of (T -> T)

import {
  run,
  andThen,
  fromBuilder,
  asBuilder,
  timeoutBuilder,
  headerBuilder,
  withBuilder,
  onlyBuilder,
  hiddenBuilder,
  ignoreErrorsBuilder,
  modifiersBuilder,
  applyBuilder
} from '../src/queryBuilder';

describe('Query Builder', () => {
  it('should run a builder with an input', () => {
    const stringJoinBuilder = input => {
      return Array.of('HELLO', input).join(' ');
    };

    const result = run(stringJoinBuilder, 'COMBINATORS');

    expect(result).toBe('HELLO COMBINATORS');
  });

  it('should create a chaining builder from two builders', () => {
    const greetBuilder = input => {
      const newMessage = 'HELLO';
      const finalMessage = Array.of(newMessage, input).join(' ');

      return [newMessage, finalMessage];
    };
    const exclamationBuilder = input => {
      const newMessage = '!';
      const finalMessage = Array.of(input, newMessage).join('');

      return [newMessage, finalMessage];
    };
    const happyGreeterBuilder = andThen(greetBuilder, exclamationBuilder);

    const result = run(happyGreeterBuilder, 'COMBINATORS');

    expect(result).toContainEqual('HELLO COMBINATORS!');
  });

  it('should create query from block', () => {
    const initialQuery = {};
    const fromResource = 'heroes';

    const fromBlock = run(fromBuilder(fromResource), initialQuery);

    expect(fromBlock).toEqual([{ from: 'heroes' }, { from: 'heroes' }]);
  });

  it('should create query as block', () => {
    const initialQuery = {
      from: 'heroes'
    };
    const resultAlias = 'hero';

    const asBlock = run(asBuilder(resultAlias), initialQuery);

    expect(asBlock).toEqual([{ as: 'hero' }, { from: 'heroes', as: 'hero' }]);
  });

  it('should create query timeout block', () => {
    const initialQuery = {
      from: 'heroes'
    };
    const timeoutValue = 200;

    const timeoutBlock = run(timeoutBuilder(timeoutValue), initialQuery);

    expect(timeoutBlock).toEqual([{ timeout: 200 }, { from: 'heroes', timeout: 200 }]);
  });

  it('should create query header block', () => {
    const initialQuery = { from: 'heroes' };
    const headers = [['Accept', 'application/json'], ['Authorization', 'Basic user:pass']];

    const headerBlock = run(headerBuilder(headers), initialQuery);

    expect(headerBlock).toEqual([
      { headers: { Accept: 'application/json', Authorization: 'Basic user:pass' } },
      { from: 'heroes', headers: { Accept: 'application/json', Authorization: 'Basic user:pass' } }
    ]);
  });

  it('should create query "with" block', () => {
    const initialQuery = { from: 'heroes' };
    const paramName = 'name';
    const paramValue = 'Link';

    const withBlock = run(withBuilder(paramName, paramValue), initialQuery);

    expect(withBlock).toEqual([
      { with: { name: 'Link' } },
      { from: 'heroes', with: { name: 'Link' } }
    ]);
  });

  it('should create query "only" block', () => {
    const initialQuery = { from: 'heroes' };

    const composedOnlyBuilder = andThen(onlyBuilder('name'), onlyBuilder('stats'));
    const onlyBlock = run(composedOnlyBuilder, initialQuery);

    expect(onlyBlock).toEqual([{ only: ['stats'] }, { from: 'heroes', only: ['name', 'stats'] }]);
  });

  it('should create query "hidden" block', () => {
    const initialQuery = { from: 'heroes' };

    const hiddenBlock = run(hiddenBuilder(), initialQuery);

    expect(hiddenBlock).toEqual([{ hidden: true }, { from: 'heroes', hidden: true }]);
  });

  it('should create query "ignore errors" block', () => {
    const initialQuery = { from: 'heroes' };
    const ignoreErrors = true;

    const ignoreErrorsBlock = run(ignoreErrorsBuilder(ignoreErrors), initialQuery);

    expect(ignoreErrorsBlock).toEqual([
      { ignoreErrors: true },
      { from: 'heroes', ignoreErrors: true }
    ]);
  });

  it('should create query "use" block', () => {
    const initialQuery = { from: 'heroes' };
    const modifiers = [['use-cache', 600]];

    const modifiersBlock = run(modifiersBuilder(modifiers), initialQuery);

    expect(modifiersBlock).toEqual([
      { modifiers: { 'use-cache': 600 } },
      { from: 'heroes', modifiers: { 'use-cache': 600 } }
    ]);
  });

  describe('apply operator', () => {
    it('should define the apply operator to the with block for the given function name', () => {
      const initialQuery = { from: 'heroes' };
      const operatorFunctionName = 'flatten';
      const paramName = 'using';
      const paramValue = ['sword', 'shield'];

      const builder = withBuilder(paramName, paramValue);
      const queryBuilder = applyBuilder(operatorFunctionName, builder);
      const applyOperatorBlock = run(queryBuilder, initialQuery);

      expect(applyOperatorBlock).toEqual([
        { apply: { with: { using: 'flatten' } } },
        {
          from: 'heroes',
          with: { using: ['sword', 'shield'] },
          apply: { with: { using: 'flatten' } }
        }
      ]);
    });

    it('should define the apply operator to the only block or the given function name', () => {
      const initialQuery = { from: 'heroes' };

      const builder = andThen(onlyBuilder('skills'), onlyBuilder('name'));
      const queryBuilder = applyBuilder('matches("^Super")', builder);
      const applyOperatorBlock = run(queryBuilder, initialQuery);

      expect(applyOperatorBlock).toEqual([
        { apply: { only: { name: 'matches("^Super")' } } },
        {
          from: 'heroes',
          only: ['skills', 'name'],
          apply: { only: { name: 'matches("^Super")' } }
        }
      ]);
    });
  });
});
