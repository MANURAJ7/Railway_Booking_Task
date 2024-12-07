import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import io from "socket.io-client";
import Login from "./components/Login";
import SearchTrain from "./components/SearchTrain";
import AdminPage from "./components/AdminPage";

function App() {
  const [socket, setSocket] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState("");

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return <Navigate to="/Login" replace />;
    }

    // Admin-only route check
    if (adminOnly && !isAdmin) {
      return <Navigate to="/Login" replace />;
    }

    return children;
  };

  useEffect(() => {
    const newSocket = io.connect("http://localhost:3001");
    setSocket(newSocket);
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAdmin(false);
    setSocket(null);
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Login" replace />} />
      <Route
        path="/Login"
        element={<Login setIsAdmin={setIsAdmin} setUser={setUser} />}
      />

      <Route
        path="/SearchTrain"
        element={
          <ProtectedRoute>
            <SearchTrain socket={socket} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/AdminPage"
        element={
          <ProtectedRoute adminOnly>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect to login if no route matches */}
      <Route path="*" element={<Navigate to="/Login" replace />} />
    </Routes>
  );
}

export default App;
