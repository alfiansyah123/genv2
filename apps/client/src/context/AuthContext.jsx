import React, { createContext, useContext, useState, useEffect } from 'react';
import API_URL from '../config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is logged in on mount
        const authData = localStorage.getItem('admin_auth');
        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                setIsAuthenticated(true);
                setUser(parsed);
            } catch (e) {
                localStorage.removeItem('admin_auth');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (password) => {
        try {
            // In development, we need to point to the server port 3000
            // In production (Vercel), we'll use environment variable
            // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Removed local definition

            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (response.ok) {
                const userData = { username: data.user.username, token: data.token };
                localStorage.setItem('admin_auth', JSON.stringify(userData));
                setIsAuthenticated(true);
                setUser(userData);
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Connection to server failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_auth');
        setIsAuthenticated(false);
        setUser(null);
    };

    const value = {
        isAuthenticated,
        isLoading,
        user,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
