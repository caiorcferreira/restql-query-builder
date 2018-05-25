import { compose, flatten, merge } from 'ramda';

import {
  run,
  andThen,
  createFromBlock,
  createAsBlock,
  createTimeoutBlock,
  createHeaderBlock,
  createWithBlock,
  createHiddenBlock,
  createOnlyBlock,
  createIgnoreErrorsBlock,
  createModifiersBlock,
  applyOperator
} from '../src/queryBuilder';

describe('Query Builder', () => {
  it('should create a result from the input with the given builder and reducer', () => {
    const createMessageBlock = () => ({ message: 'HELLO' });

    const result = run(merge, createMessageBlock, {});

    expect(result).toEqual({ message: 'HELLO' });
  });

  it('should get a new builder from composing two other ones', () => {
    const greetingMessageBuilder = () => 'HELLO';
    const guestMessageBuilder = () => 'WORLD';

    const messageBuilder = andThen(Array.of, [greetingMessageBuilder, guestMessageBuilder]);

    expect(messageBuilder()).toEqual(['HELLO', 'WORLD']);
  });

  it('should get a new builder with the apply operator added', () => {
    const fromBlock = createFromBlock('heroes');
    const asBlock = createAsBlock('hero');
    const withBlock = createWithBlock('weapons', ['sword', 'shield']);

    const initialBuilder = andThen(Array.of, [fromBlock, asBlock, withBlock]);
    const query = applyOperator(compose(flatten, Array.of), initialBuilder, 'flatten');

    expect(query()).toEqual([
      { from: 'heroes' },
      { as: 'hero' },
      { with: { weapons: ['sword', 'shield'] } },
      { apply: { with: { weapons: 'flatten' } } }
    ]);
  });

  describe('Block creators', () => {
    it('should create from block', () => {
      const resource = 'heroes';
      const fromBlock = createFromBlock(resource);

      expect(fromBlock()).toEqual({ from: 'heroes' });
    });

    it('should create as block', () => {
      const resourceAlias = 'hero';
      const asBlock = createAsBlock(resourceAlias);

      expect(asBlock()).toEqual({ as: 'hero' });
    });

    it('should create timeout block', () => {
      const timeoutValue = 200;
      const timeoutBlock = createTimeoutBlock(timeoutValue);

      expect(timeoutBlock()).toEqual({ timeout: 200 });
    });

    it('should create header block', () => {
      const headers = [['Accept', 'application/json'], ['Authorization', 'Basic user:pass']];

      const headerBlock = createHeaderBlock(headers);

      expect(headerBlock()).toEqual({
        headers: { Accept: 'application/json', Authorization: 'Basic user:pass' }
      });
    });

    it('should create with block', () => {
      const paramName = 'name';
      const paramValue = 'Link';
      const withBlock = createWithBlock(paramName, paramValue);

      expect(withBlock()).toEqual({ with: { name: 'Link' } });
    });

    it('should create only block', () => {
      const onlyFilter = ['name', 'stats'];

      const onlyBlock = createOnlyBlock(onlyFilter);

      expect(onlyBlock()).toEqual({ only: ['name', 'stats'] });
    });

    it('should create hidden block', () => {
      const shouldBeHidden = true;

      const hiddenBlock = createHiddenBlock(shouldBeHidden);

      expect(hiddenBlock()).toEqual({ hidden: true });
    });

    it('should create ignore errors block', () => {
      const shouldIgnoreErrors = true;

      const ignoreErrorsBlock = createIgnoreErrorsBlock(shouldIgnoreErrors);

      expect(ignoreErrorsBlock()).toEqual({ ignoreErrors: true });
    });

    it('should create modifiers block', () => {
      const modifiers = [['use-cache', 600]];

      const modifiersBlock = createModifiersBlock(modifiers);

      expect(modifiersBlock()).toEqual({ modifiers: { 'use-cache': 600 } });
    });
  });
});
