export function saveToken(token: string) { if (typeof window !== 'undefined') localStorage.setItem('echotale_token', token); }
export function clearToken() { if (typeof window !== 'undefined') localStorage.removeItem('echotale_token'); }
export function getToken() { return typeof window === 'undefined' ? null : localStorage.getItem('echotale_token'); }
