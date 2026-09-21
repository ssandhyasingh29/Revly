import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import CommunityPage from "./pages/CommunityPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MessagesPage from "./pages/MessagesPage";
import ProductPage from "./pages/ProductPage";
import ProfilePage from "./pages/ProfilePage";
import AddProductPage from "./pages/AddProductPage";
import NotificationsPage from "./pages/NotificationsPage";
import ReviewsPage from "./pages/ReviewsPage";
import ProductExplorePage from "./pages/ProductExplorePage";
import BlogPage from "./pages/BlogPage";
import BlogArticlePage from "./pages/BlogArticlePage";
import VerifyEmailPage from "./pages/VerifyEmailPage";


export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        
        <Route path="/" element={<HomePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
         <Route path="/verify-email"element={<VerifyEmailPage />}/>
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/add-product" element={<AddProductPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/product-explore"element={<ProductExplorePage />}/>
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogArticlePage />} />
       
      </Routes>
      <Footer />
    </>
  );
}
