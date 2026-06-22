import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";

const AppContent = () => {
  
  return (
    <Routes>
      <Route path="/" element={<Login />} />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter basename="/NDC_CMS/">
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
