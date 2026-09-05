import assert from 'node:assert/strict';
import test from 'node:test';
import { acceptsBetCurrency, blocksFinancialMutation, getLaunchMode, isCashOnlyLaunch } from './launchMode';

test('defaults to play-cash mode unless full mode is explicitly enabled', () => {
  assert.equal(getLaunchMode(undefined), 'play_cash');
  assert.equal(getLaunchMode('play_cash'), 'play_cash');
  assert.equal(getLaunchMode('unexpected'), 'play_cash');
  assert.equal(getLaunchMode('full'), 'full');
  assert.equal(isCashOnlyLaunch(undefined), true);
  assert.equal(isCashOnlyLaunch('full'), false);
});

test('cash-only mode blocks financial mutations but allows read-only requests', () => {
  assert.equal(blocksFinancialMutation(undefined, 'GET'), false);
  assert.equal(blocksFinancialMutation('play_cash', 'POST'), true);
  assert.equal(blocksFinancialMutation('play_cash', 'PATCH'), true);
  assert.equal(blocksFinancialMutation('full', 'POST'), false);
});

test('cash-only mode accepts only WeParlay Cash bets', () => {
  assert.equal(acceptsBetCurrency(undefined, 'weparlay_cash'), true);
  assert.equal(acceptsBetCurrency(undefined, 'real_money'), false);
  assert.equal(acceptsBetCurrency(undefined, 'crypto'), false);
  assert.equal(acceptsBetCurrency('full', 'crypto'), true);
});
