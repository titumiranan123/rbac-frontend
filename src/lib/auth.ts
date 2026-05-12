let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = (): string | null => {
  return accessToken;
};

export const setRefreshToken = (token: string) => {
  refreshToken = token;
};

export const getRefreshToken = (): string | null => {
  return refreshToken;
};

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};

export const isAuthenticated = (): boolean => {
  return accessToken !== null;
};

export const auth = {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAuthenticated,
};

export default auth;