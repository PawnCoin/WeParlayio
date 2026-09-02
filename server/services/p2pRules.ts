export const p2pMoney = (value: number) => Math.round(value * 100) / 100;

export function assertP2pAmount(value: number) {
  if (!Number.isFinite(value) || value <= 0 || p2pMoney(value) !== value) {
    throw new Error("Bet amount must be positive and use no more than two decimal places");
  }
}

export function validateP2pAcceptance(challenge: any, userId: string, pick: string, now = new Date()) {
  if (challenge.status !== "open") throw new Error("Challenge is no longer available");
  if (challenge.expiresAt <= now) throw new Error("Challenge has expired");
  if (challenge.challengerId === userId) throw new Error("Cannot accept your own challenge");
  if (!challenge.isPublic && challenge.challengeeId && challenge.challengeeId !== userId) throw new Error("This challenge is not for you");
  if (!challenge.isPublic && !challenge.challengeeId && Array.isArray(challenge.allowedFriends) && !challenge.allowedFriends.includes(userId)) throw new Error("You are not allowed to accept this private challenge");
  if (pick.trim().toLowerCase() === challenge.challengerPick.trim().toLowerCase()) throw new Error("You must choose the opposing outcome");
}

export function validateP2pSettlement(challenge: any, winnerId: string) {
  if (!["accepted", "pending_settlement"].includes(challenge.status ?? "")) throw new Error("Challenge is not in a settleable state");
  if (![challenge.challengerId, challenge.challengeeId].includes(winnerId)) throw new Error("Winner must be a participant in the challenge");
  if (p2pMoney(challenge.escrowHeld ?? 0) !== p2pMoney(challenge.totalPot)) throw new Error("Escrow is not fully funded");
}
