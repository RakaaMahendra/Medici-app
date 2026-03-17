import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("medici_token");
    const savedUser = localStorage.getItem("medici_user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("medici_token");
        localStorage.removeItem("medici_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const token = res.data.token;
    localStorage.setItem("medici_token", token);

    // Decode JWT payload
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userData = { id: payload.id, role: payload.role, email };
    localStorage.setItem("medici_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    await authAPI.register(data);
  };

  const logout = () => {
    localStorage.removeItem("medici_token");
    localStorage.removeItem("medici_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
