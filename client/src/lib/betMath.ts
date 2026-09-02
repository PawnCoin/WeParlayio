export const americanToDecimal = (odds: number) => {
  if (!Number.isFinite(odds) || odds === 0) throw new Error('Invalid American odds');
  return odds > 0 ? 1 + odds / 100 : 1 + 100 / Math.abs(odds);
};

export const decimalToAmerican = (odds: number) => {
  if (!Number.isFinite(odds) || odds <= 1) throw new Error('Invalid decimal odds');
  return Math.round(odds >= 2 ? (odds - 1) * 100 : -100 / (odds - 1));
};

export const calculateParlay = (americanOdds: number[], stake: number) => {
  if (americanOdds.length < 2 || americanOdds.length > 9) throw new Error('Parlays require 2–9 selections');
  if (!Number.isFinite(stake) || stake <= 0) throw new Error('Parlay stake must be positive');
  const decimalOdds = americanOdds.reduce((product, odds) => product * americanToDecimal(odds), 1);
  return {
    decimalOdds,
    americanOdds: decimalToAmerican(decimalOdds),
    payout: Math.round(stake * decimalOdds * 100) / 100,
  };
};
