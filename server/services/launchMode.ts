export type LaunchMode = 'play_cash' | 'full';

export function getLaunchMode(value: string | undefined): LaunchMode {
  return value === 'full' ? 'full' : 'play_cash';
}

export function isCashOnlyLaunch(value: string | undefined): boolean {
  return getLaunchMode(value) === 'play_cash';
}

export function blocksFinancialMutation(mode: string | undefined, method: string): boolean {
  return isCashOnlyLaunch(mode) && method.toUpperCase() !== 'GET';
}

const financialRoutePrefixes = ['/api/banking', '/api/crypto', '/api/payments'];

export function isRestrictedFinancialPath(path: string): boolean {
  return financialRoutePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function acceptsBetCurrency(mode: string | undefined, currency: string): boolean {
  return !isCashOnlyLaunch(mode) || currency === 'weparlay_cash';
}
