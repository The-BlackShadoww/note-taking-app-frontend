// Where the API lives: the local dev server, or the deployed backend on Vercel
const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
export const API_URL = isLocal
    ? "http://localhost:3000/api"
    : "https://note-taking-app-backend-lac.vercel.app/api";

const TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// One helper for every API call: adds the JWT, sends/parses JSON, and turns
// error responses into exceptions carrying the server's message.
export async function api(path, { method = "GET", body } = {}) {
    const token = getToken();
    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    // An expired or invalid token: forget it and let the app show the login page
    if (res.status === 401 && token) {
        clearToken();
        window.dispatchEvent(new Event("auth-expired"));
    }

    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
}
