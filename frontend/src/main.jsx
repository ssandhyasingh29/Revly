import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ToastProvider } from "./context/ToastContext";

import "./styles/global.css";
import "./styles/app.css";
import "./styles/navbar.css";
import "./styles/footer.css";
import "./styles/home.css";
import "./styles/community.css";
import "./styles/CommunityBanner.css";
import "./styles/messages.css";
import "./styles/reviews.css";
import "./styles/auth.css";

import "./styles/ProfilePage.css";
import "./styles/addproduct.css";
import "./styles/NotificationsPage.css";
import "./styles/ProfileAvatar.css";
import "./styles/ReviewsPage.css";
import "./styles/ProductExplorePage.css";
import "./styles/BlogPage.css";
import "./styles/UserCard.css";
 ToastProvider wraps
// everything since both auth and chat show toast messages on errors.

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
