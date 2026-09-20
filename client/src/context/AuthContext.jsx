import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error("Invalid saved user data.");

                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }

        setLoading(false);

    }, []);

    const login = (authData) => {

        localStorage.setItem("token", authData.token);

        const userData = {
            userId: authData.userId,
            name: authData.name,
            email: authData.email,
            role: authData.role
        };

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setToken(authData.token);
        setUser(userData);
    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };

    const isAuthenticated = Boolean(token && user);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}

