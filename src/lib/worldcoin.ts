export const WORLDCOIN_CONFIG = {
  appId: import.meta.env.VITE_WORLDCOIN_APP_ID || '',
  action: import.meta.env.VITE_WORLDCOIN_ACTION || 'publish-article',
  verification_level: 'device' as const, // or 'orb'
};

export interface WorldIDVerification {
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: string;
}
