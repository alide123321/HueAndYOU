import {Complementary} from '../../../../src/harmony/ComplementaryOKLCH.js';
import {HarmonyStrategy} from '../../../../src/harmony/HarmonyStrategy.js';

describe('ComplementaryOKLCH Instantiation', () => {
  test('should create multiple instances without side effects', () => {
    const strat1 = new Complementary();
    const strat2 = new Complementary();
    expect(strat1).not.toBe(strat2);
    expect(strat1).toBeInstanceOf(Complementary);
    expect(strat2).toBeInstanceOf(Complementary);
  });
});
