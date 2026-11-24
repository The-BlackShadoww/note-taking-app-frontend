import { createContext, useContext, useEffect, useState } from "react";
import { api, clearToken, getToken, saveToken } from "./api.js";

// Who is logged in, shared with every component through React context

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // With a saved token we first ask the server who we are
    const [checking, setChecking] = useState(Boolean(getToken()));

    useEffect(() => {
        if (!getToken()) return;
        api("/users/me")
            .then((data) => setUser(data.user))
            .catch(() => clearToken())
            .finally(() => setChecking(false));
    }, []);

    // api.js fires this when the server rejects our token
    useEffect(() => {
        const onExpired = () => setUser(null);
        window.addEventListener("auth-expired", onExpired);
        return () => window.removeEventListener("auth-expired", onExpired);
    }, []);

    async function login(email, password) {
        const data = await api("/auth/login", {
            method: "POST",
            body: { email, password },
        });
        saveToken(data.token);
        setUser(data.user);
    }

    async function register(fields) {
        const data = await api("/auth/register", {
            method: "POST",
            body: fields,
        });
        saveToken(data.token);
        setUser(data.user);
    }

    function logout() {
        clearToken();
        setUser(null);
    }

    const value = { user, setUser, checking, login, register, logout };
    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
