import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig.jsx";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function TaskPage({ user }) {
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  // 🔄 Fetch only user-assigned orders
  const fetchAssignedOrders = async () => {
    try {
      const q = query(collection(db, "orders"), where("assignedTo", "==", user.email));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setAssignedOrders(list);
    } catch (err) {
      console.error("Error fetching assigned tasks:", err);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, [user]);

  // ✏️ Allow user to update status or notes
  const handleUpdateOrder = async (id, updatedFields) => {
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, updatedFields);
      alert("✅ Task updated successfully!");
      setEditingId(null);
      fetchAssignedOrders();
    } catch (error) {
      console.error("Error updating order:", error);
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
      <h2>🧩 Your Assigned Tasks</h2>

      {assignedOrders.length === 0 ? (
        <p>No tasks assigned to you yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>SKU</th>
              <th style={thStyle}>Quantity</th>
              <th style={thStyle}>Courier Partner</th>
              <th style={thStyle}>AWB Number</th>
              <th style={thStyle}>Dispatch Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Notes</th>
              <th style={thStyle}>Tracking</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignedOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={tdStyle}>{order.orderId}</td>
                <td style={tdStyle}>{order.sku}</td>
                <td style={tdStyle}>{order.quantity}</td>
                <td style={tdStyle}>{order.courierPartner}</td>
                <td style={tdStyle}>{order.awbNumber}</td>
                <td style={tdStyle}>{order.dispatchDate}</td>

                {/* Editable status */}
                <td style={tdStyle}>
                  {editingId === order.id ? (
                    <select
                      defaultValue={order.status}
                      onChange={(e) =>
                        handleUpdateOrder(order.id, { status: e.target.value })
                      }
                    >
                      <option value="Dispatched">Dispatched</option>
                      <option value="Not Dispatched">Not Dispatched</option>
                    </select>
                  ) : (
                    order.status
                  )}
                </td>

                {/* Editable notes */}
                <td style={tdStyle}>
                  {editingId === order.id ? (
                    <select
                      defaultValue={order.notes}
                      onChange={(e) =>
                        handleUpdateOrder(order.id, { notes: e.target.value })
                      }
                    >
                      <option value="Delivered">Delivered</option>
                      <option value="Customer Return">Customer Return</option>
                      <option value="In Transit">In Transit</option>
                      <option value="RTO">RTO</option>
                    </select>
                  ) : (
                    order.notes
                  )}
                </td>

                {/* Tracking link */}
                <td style={tdStyle}>
                  {order.liveTracking ? (
                    <a href={order.liveTracking} target="_blank" rel="noreferrer">
                      Track
                    </a>
                  ) : (
                    "-"
                  )}
                </td>

                <td style={tdStyle}>
                  {editingId === order.id ? (
                    <button onClick={() => setEditingId(null)} style={btnCancel}>
                      Cancel
                    </button>
                  ) : (
                    <button onClick={() => setEditingId(order.id)} style={btnEdit}>
                      Update
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// 🎨 Styles
const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
  color: "#000",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};

const btnEdit = {
  background: "#17a2b8",
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
