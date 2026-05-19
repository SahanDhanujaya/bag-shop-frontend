import { LoginCredintials } from "../types";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

const login = (loginCredintials: LoginCredintials) => {
    return fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // credentials: "include",
        body: JSON.stringify(loginCredintials),
    });
};

const register = (credintials: LoginCredintials) => {
    return fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credintials),
    });
};

const logout = () => {
    return fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });
}
export { login, register, logout };