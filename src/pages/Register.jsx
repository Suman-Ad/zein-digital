import React, { useState } from "react";
import { auth, db } from "../firebaseConfig.jsx";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "User",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2️⃣ Send email verification
      await sendEmailVerification(user);
      alert("✅ Account created! Check your email for verification.");

      // 3️⃣ Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        is_Active: false, // until verified
        createdAt: new Date(),
      });

      // 4️⃣ Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "User",
      });

      navigate("/login");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div style={container}>
      <h2>📝 Register Account</h2>
      <form onSubmit={handleRegister} style={form}>
        <input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

const container = { padding: "40px", textAlign: "center" };
const form = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  maxWidth: "320px",
  margin: "0 auto",
};
