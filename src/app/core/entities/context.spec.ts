import { Context } from '~/app/core/entities/context';

describe('Context', () => {
  let entity: Context;
  const context = {
    merchant: 'merchant',
    channel: 'channel',
    orderId: 'orderId',
  };

  it('equals should return true for the same context', () => {
    expect(new Context(context).equals(new Context(context))).toBe(true);
  });

  it('equals should return false for different contexts', () => {
    Object.keys(context).forEach((key) => {
      const other = { ...context };
      other[key as keyof typeof context] = 'other';
      expect(new Context(context).equals(new Context(other))).toBe(false);
    });
  });
});
