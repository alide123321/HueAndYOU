import {Complementary} from '../../../../src/harmony/ComplementaryHSL.js';

describe('ComplementaryHSL', () => {
  test('should instantiate without errors', () => {
    const strat = new Complementary();
    expect(strat).toBeInstanceOf(Complementary);
  });
});
