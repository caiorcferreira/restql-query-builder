import {
  createFromBlock,
  createAsBlock,
  createTimeoutBlock,
  createHeaderBlock,
  createWithBlock,
  createHiddenBlock,
  createOnlyBlock,
  createIgnoreErrorsBlock,
  createModifiersBlock
} from '../src/blockCreators';

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

  it('should create header block with object', () => {
    const headers = {
      Accept: 'application/json',
      Authorization: 'Basic user:pass'
    };

    // [['Accept', 'application/json'], ['Authorization', 'Basic user:pass']];

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
    const onlyBlock = createOnlyBlock('name');

    expect(onlyBlock()).toEqual({ only: ['name'] });
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
