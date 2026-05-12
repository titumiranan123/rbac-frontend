let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setAccessToken = (token: string) => { accessToken = token; };
export const getAccessToken = (): string | null => accessToken;
export const setRefreshToken = (token: string) => { refreshToken = token; };
export const getRefreshToken = (): string | null => refreshToken;
export const setTokens = (access: string, refresh: string) => { accessToken = access; refreshToken = refresh; };
export const clearTokens = () => { accessToken = null; refreshToken = null; };
export const isAuthenticated = (): boolean => accessToken !== null;