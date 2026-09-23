import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiFetch } from "../config/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("revlyUser");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== "revlyUser") return;

      if (event.newValue) {
        const updatedUser = JSON.parse(event.newValue);
        setUser(updatedUser);
      } else {
        setUser(null);
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);


  const login = async (email, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    localStorage.setItem(
      "revlyUser",
      JSON.stringify(data)
    );

    setUser(data);

    return data;
  };

  const register = async (
    username,
    email,
    password,
    skinType
  ) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        password,
        skinType,
      }),
    });

    return data;
  };

  const verifyEmail = async (email, token) => {
    const data = await apiFetch(
      "/auth/verify-email",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          token,
        }),
      }
    );

    localStorage.setItem(
      "revlyUser",
      JSON.stringify(data)
    );

    setUser(data);

    return data;
  };

  const resendVerificationEmail = async (email) => {
    return apiFetch(
      "/auth/resend-verification",
      {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      }
    );
  };

  const logout = () => {
    localStorage.removeItem("revlyUser");
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updatedUser = {
        ...prev,
        ...updatedFields,
      };

      localStorage.setItem(
        "revlyUser",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        verifyEmail,
        resendVerificationEmail,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}