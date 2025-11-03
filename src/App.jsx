import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OrderManagement from "./pages/OrderManagement.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import AdminUserManagement from "./pages/AdminUserManagement.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TaskPage from './pages/Task.jsx';


function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/order-management"
          element={
            <ProtectedRoute>
              {user && (user.role === "Admin" || user.role === "Manager") ? (
                <OrderManagement user={user} />
              ) : (
                <div style={{ padding: "20px", color: "red" }}>Access Denied 🚫</div>
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminUserManagement user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TaskPage user={user} />
            </ProtectedRoute>
          }
        />
        {/* Public Pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Fallback */}
        {/* <Route path="/" element={<Navigate to="/" />} /> */}
        {/* <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
