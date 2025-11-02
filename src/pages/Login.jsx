import React, { useState } from "react";
import { auth, db } from "../firebaseConfig.jsx";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1️⃣ Sign in user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2️⃣ Check if verified
      if (!user.emailVerified) {
        alert("⚠️ Please verify your email before logging in.");
        await signOut(auth);
        return;
      }

      // 3️⃣ Get Firestore user data
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        // 4️⃣ Update Firestore is_Active field
        await updateDoc(userRef, { is_Active: true });

        // 5️⃣ Save complete user info to localStorage
        const fullUserData = { ...userData, is_Active: true };
        localStorage.setItem("user", JSON.stringify(fullUserData));

        setUser(fullUserData);
        alert(`✅ Welcome ${userData.name || user.email}!`);
        navigate("/");
      } else {
        alert("⚠️ User record not found in Firestore!");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    setUser(null);
    alert("👋 Logged out successfully!");
  };

  return (
    <div style={container}>
      {user ? (
        <>
          <h2>Welcome, {user.name || user.email}</h2>
          <p>Role: {user.role}</p>
          <p>Status: {user.is_Active ? "Active ✅" : "Inactive ❌"}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <h2>Login</h2>
          <form onSubmit={handleLogin} style={form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        </>
      )}
      <button onClick={() => navigate("/register")}>Create an Account</button>
    </div>
  );
}

const container = { padding: "40px", textAlign: "center" };
const form = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  maxWidth: "300px",
  margin: "0 auto",
};
