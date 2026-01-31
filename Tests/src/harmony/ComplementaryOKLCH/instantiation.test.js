import {Complementary} from '../../../../src/harmony/ComplementaryOKLCH.js';

describe('ComplementaryOKLCH', () => {
  test('should instantiate without errors', () => {
    const strat = new Complementary();
    expect(strat).toBeInstanceOf(Complementary);
  });
});
