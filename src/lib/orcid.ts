export const ORCID_CONFIG = {
  clientId: import.meta.env.VITE_ORCID_CLIENT_ID,
  authUrl: 'https://orcid.org/oauth/authorize',
  scopes: '/authenticate',
  redirectUri: `${window.location.origin}/orcid/callback`,
};

export const getOrcidAuthUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: ORCID_CONFIG.clientId,
    response_type: 'code',
    scope: ORCID_CONFIG.scopes,
    redirect_uri: ORCID_CONFIG.redirectUri,
    state: state,
  });
  return `${ORCID_CONFIG.authUrl}?${params}`;
};