import React from "react";
import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");

  const showToast = (text) => {
    setMessage(text);
    window.clearTimeout(window.__glowToast);
    window.__glowToast = window.setTimeout(() => setMessage(""), 2200);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && <div className="toast">{message}</div>}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}