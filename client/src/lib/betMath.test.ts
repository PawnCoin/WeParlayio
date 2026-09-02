import assert from 'node:assert/strict';
import test from 'node:test';
import { americanToDecimal, calculateParlay, decimalToAmerican } from './betMath';

test('converts positive and negative American odds', () => {
  assert.equal(americanToDecimal(150), 2.5);
  assert.equal(americanToDecimal(-200), 1.5);
  assert.equal(decimalToAmerican(2.5), 150);
  assert.equal(decimalToAmerican(1.5), -200);
});

test('multiplies 2–9 parlay legs and uses one stake', () => {
  const quote = calculateParlay([-110, -110], 10);
  assert.ok(Math.abs(quote.decimalOdds - 3.6446280992) < 0.000000001);
  assert.equal(quote.americanOdds, 264);
  assert.equal(quote.payout, 36.45);
});

test('rejects invalid leg counts and stakes', () => {
  assert.throws(() => calculateParlay([-110], 10), /2–9/);
  assert.throws(() => calculateParlay(Array(10).fill(-110), 10), /2–9/);
  assert.throws(() => calculateParlay([-110, 120], 0), /positive/);
});
