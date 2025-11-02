
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig.jsx";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login"); // redirect if not logged in
      } else {
        setUser(currentUser);
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // Show loading state while checking auth
  if (checking) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Checking authentication...
      </div>
    );
  }

  // Render children (the protected page)
  return user ? children : null;
}
