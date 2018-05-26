import { merge } from 'ramda';

import { run, andThen } from '../src/builder';

describe('Builder', () => {
  it('should create a result from the input with the given builder and reducer', () => {
    const createMessageBlock = () => ({ message: 'HELLO' });

    const result = run(merge, createMessageBlock, {});

    expect(result).toEqual({ message: 'HELLO' });
  });

  it('should get a new builder from composing two other ones', () => {
    const greetingMessageBuilder = () => 'HELLO';
    const guestMessageBuilder = () => 'WORLD';

    const messageBuilder = andThen(Array.of, greetingMessageBuilder, guestMessageBuilder);

    expect(messageBuilder()).toEqual(['HELLO', 'WORLD']);
  });
});
