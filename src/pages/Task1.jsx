import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig.jsx";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function TaskPage({ user }) {
  const [tasks, setTasks] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newTask, setNewTask] = useState({
    taskId: "",
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
    notes: "",
    assignedTo: "",
  });

  // 🟢 Fetch users for assigning
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const list = querySnapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.role === "User" && u.is_Active);
    setUsersList(list);
  };

  // 🟢 Fetch tasks
  const fetchTasks = async () => {
    const localUser = JSON.parse(localStorage.getItem("user")) || user;
    let q;

    if (localUser.role === "User") {
      q = query(collection(db, "tasks"), where("assignedTo", "==", localUser.email));
    } else {
      q = collection(db, "tasks");
    }

    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setTasks(list);
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  // 🟢 Add task
  const handleAddTask = async () => {
    if (!newTask.title || !newTask.assignedTo) {
      alert("Please fill title and assigned user!");
      return;
    }

    await addDoc(collection(db, "tasks"), {
      ...newTask,
      createdAt: new Date(),
      createdBy: user?.email || "Unknown",
    });

    alert("✅ Task added!");
    setNewTask({
      taskId: "",
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      status: "Pending",
      notes: "",
      assignedTo: "",
    });
    fetchTasks();
  };

  // 🟠 Update task
  const handleUpdateTask = async (id, updatedFields) => {
    const ref = doc(db, "tasks", id);
    await updateDoc(ref, updatedFields);
    alert("✅ Task updated!");
    setEditingId(null);
    fetchTasks();
  };

  // 🔴 Delete task
  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteDoc(doc(db, "tasks", id));
      alert("🗑️ Task deleted!");
      fetchTasks();
    }
  };

  // 🚪 Logout
  const handleLogout = async () => {
    await signOut(auth);
    alert("👋 Logged out successfully!");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome, {user?.name}</h2>
      <button onClick={handleLogout}>Logout</button>
      <h2>🗂️ Task Management</h2>

      {/* 🆕 Add New Task */}
      {(user?.role === "Manager" || user?.role === "Admin") && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            marginBottom: "20px",
            backgroundColor: "#f9f9f9",
            padding: "15px",
            borderRadius: "10px",
          }}
        >
          <input
            placeholder="Task ID"
            value={newTask.taskId}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, taskId: e.target.value }))
            }
          />
          <input
            placeholder="Title"
            value={newTask.title}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, title: e.target.value }))
            }
          />
          <input
            placeholder="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, description: e.target.value }))
            }
          />
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, dueDate: e.target.value }))
            }
          />
          <select
            value={newTask.priority}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, priority: e.target.value }))
            }
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select
            value={newTask.status}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, status: e.target.value }))
            }
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={newTask.assignedTo}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, assignedTo: e.target.value }))
            }
          >
            <option value="">Assign To</option>
            {usersList.map((u) => (
              <option key={u.id} value={u.email}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
          <button
            onClick={handleAddTask}
            style={{
              gridColumn: "span 3",
              padding: "10px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ➕ Add Task
          </button>
        </div>
      )}

      {/* 🧾 Tasks Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={thStyle}>Task ID</th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Due Date</th>
            <th style={thStyle}>Priority</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Notes</th>
            <th style={thStyle}>Assigned To</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={tdStyle}>{task.taskId}</td>
              <td style={tdStyle}>{task.title}</td>
              <td style={tdStyle}>{task.description}</td>
              <td style={tdStyle}>{task.dueDate}</td>
              <td style={tdStyle}>{task.priority}</td>

              <td style={tdStyle}>
                {editingId === task.id ? (
                  <select
                    defaultValue={task.status}
                    onChange={(e) =>
                      handleUpdateTask(task.id, { status: e.target.value })
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : (
                  task.status
                )}
              </td>

              <td style={tdStyle}>
                {editingId === task.id ? (
                  <input
                    defaultValue={task.notes}
                    onBlur={(e) =>
                      handleUpdateTask(task.id, { notes: e.target.value })
                    }
                  />
                ) : (
                  task.notes || "-"
                )}
              </td>

              <td style={tdStyle}>{task.assignedTo || "-"}</td>

              <td style={tdStyle}>
                {editingId === task.id ? (
                  <button onClick={() => setEditingId(null)} style={btnCancel}>
                    Cancel
                  </button>
                ) : (
                  <button onClick={() => setEditingId(task.id)} style={btnEdit}>
                    Edit
                  </button>
                )}
                {(user?.role === "Manager" || user?.role === "Admin") && (
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    style={btnDelete}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
  color: "#000000ff",
};

const tdStyle = {
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
