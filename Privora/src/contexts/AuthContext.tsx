import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

import { signup as apiSignup, login as apiLogin } from "@/lib/api";
import { getUser, logout as authLogout, type User } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  setUserDirect: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getUser());
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await apiLogin({
  email,
  password
});
    setUser(res.user);
    setIsLoading(false);
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await apiSignup({
  email,
  password
});
    setUser(res.user);
    setIsLoading(false);
    return res.user;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const setUserDirect = (user: User) => {
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, setUserDirect }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}