export function fixCrazySan(san: string) {
  return san[0] === 'P' ? san.slice(1) : san;
}

export const plyToTurn = (ply: number): number => Math.floor((ply - 1) / 2) + 1;
