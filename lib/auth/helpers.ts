const STORAGE_KEY = 'LH_STORAGE_KEY'; // lens hub storage key

// Determine if exp date is expired
export function isTokenExpired(exp: number) {
    if (!exp) return true;
    if (Date.now() >= exp * 1000) {
        return false;
    }
    return true;
}

// Read access token from Lens (local storage)
export function readAccessToken () {
    // Ensure user is on client environment
    if (typeof window === 'undefined') return null;
    const ls = localStorage || window.localStorage;
    if (!ls) {
        throw new Error("LocalStorage is not available");
    }

    const data = ls.getItem(STORAGE_KEY);
    if (!data) return null;
    
    return JSON.parse(data) as {
        accessToken: string;
        refreshToken: string;
        exp: number;
    };
}

// Set access token in storage
export function setAccessToken (
    accessToken: string,
    refreshToken: string,
) {
    // Parse JWT token to get expiration date
    const { exp } = parseJwt(accessToken);

    // Set all three variables in local storage
    const ls = localStorage || window.localStorage;

    if (!ls) {
        throw new Error("LocalStorage is not available");
    }

    ls.setItem(STORAGE_KEY, JSON.stringify({
        accessToken,
        refreshToken,
        exp
    }));
}

// Parse JWT token and extract params
export function parseJwt (token: string) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
        window
            .atob(base64)
            .split("")
            .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
    );

    return JSON.parse(jsonPayload);
}