import React, { use, useEffect, useState } from "react";
import { db } from "../firebaseConfig.jsx";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminUserManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  // 🟢 Fetch all users from Firestore
  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const userList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(userList);
  };

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (!localUser || localUser.role !== "Admin") {
      alert("⛔ Access Denied! Only Admins can access this page.");
      navigate("/login");
      return;
    }
    fetchUsers();
  }, [navigate]);

  // 🟠 Handle edit
  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditData({ ...user });
  };

  // 🟡 Handle update
  const handleUpdate = async (id) => {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      name: editData.name,
      phone: editData.phone,
      role: editData.role,
      is_Active: editData.is_Active,
    });
    alert("✅ User updated successfully!");
    setEditingId(null);
    fetchUsers();
  };

  // 🔴 Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteDoc(doc(db, "users", id));
      alert("🗑️ User deleted!");
      fetchUsers();
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>👑 Admin Panel — Manage Users</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Arial, sans-serif",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={th}>Name</th>
            <th style={th}>Email</th>
            <th style={th}>Phone</th>
            <th style={th}>Role</th>
            <th style={th}>Active</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #ddd" }}>
              {editingId === u.id ? (
                <>
                  <td style={td}>
                    <input
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </td>
                  <td style={td}>{u.email}</td>
                  <td style={td}>
                    <input
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </td>
                  <td style={td}>
                    <select
                      value={editData.role}
                      onChange={(e) =>
                        setEditData((p) => ({ ...p, role: e.target.value }))
                      }
                    >
                      <option value="User">User</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td style={td}>
                    <select
                      value={editData.is_Active ? "true" : "false"}
                      onChange={(e) =>
                        setEditData((p) => ({
                          ...p,
                          is_Active: e.target.value === "true",
                        }))
                      }
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => handleUpdate(u.id)}
                      style={btnSave}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={btnCancel}
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td style={td}>{u.name}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}>{u.phone}</td>
                  <td style={td}>{u.role}</td>
                  <td style={td}>
                    {u.is_Active ? "✅ Active" : "❌ Inactive"}
                  </td>
                  {user.role === "Admin" && (
                  <td style={td}>
                    <button
                      onClick={() => handleEdit(u)}
                      style={btnEdit}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      style={btnDelete}
                    >
                      Delete
                    </button>
                  </td>
                )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};

const td = {
  border: "1px solid #ccc",
  padding: "8px",
};

const btnEdit = {
  background: "#ffc107",
  border: "none",
  color: "#000",
  padding: "5px 8px",
  borderRadius: "5px",
  marginRight: "5px",
  cursor: "pointer",
};

const btnSave = {
  background: "#28a745",
  border: "none",
  color: "#fff",
  padding: "5px 8px",
  borderRadius: "5px",
  marginRight: "5px",
  cursor: "pointer",
};

const btnCancel = {
  background: "#6c757d",
  border: "none",
  color: "#fff",
  padding: "5px 8px",
  borderRadius: "5px",
  marginRight: "5px",
  cursor: "pointer",
};

const btnDelete = {
  background: "#dc3545",
  border: "none",
  color: "#fff",
  padding: "5px 8px",
  borderRadius: "5px",
  cursor: "pointer",
};
