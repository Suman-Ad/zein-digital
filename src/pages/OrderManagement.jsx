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

export default function OrderManagement({ user }) {
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]); // For Assign dropdown
  const [editingId, setEditingId] = useState(null);
  const [newOrder, setNewOrder] = useState({
    orderId: "",
    sku: "",
    quantity: "",
    courierPartner: "",
    awbNumber: "",
    dispatchDate: "",
    status: "Not Dispatched",
    liveTracking: "",
    notes: "In Transit",
    assignedTo: "",
  });

  // 🟢 Fetch all users (for assigning)
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const list = querySnapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.role === "User" && u.is_Active);
    setUsersList(list);
  };

  // 🟢 Fetch all orders
  const fetchOrders = async () => {
    const localUser = JSON.parse(localStorage.getItem("user")) || user;

    let q;
    if (localUser.role === "User") {
      q = query(collection(db, "orders"), where("assignedTo", "==", localUser.email));
    } else {
      q = collection(db, "orders");
    }

    const querySnapshot = await getDocs(q);
    const orderList = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    setOrders(orderList);
  };

  useEffect(() => {
    fetchUsers();
    fetchOrders();
  }, []);

  // 🟢 Add a new order
  const handleAddOrder = async () => {
    if (!newOrder.orderId || !newOrder.sku) {
      alert("Please fill required fields (Order ID, SKU).");
      return;
    }

    // ✅ Compute liveTracking URL dynamically
    let liveTracking = "";
    const awb = newOrder.awbNumber;

    if (newOrder.courierPartner === "Delhivery") {
      liveTracking = `https://www.delhivery.com/track/package/${awb}`;
    } else if (newOrder.courierPartner === "Shadowfax") {
      liveTracking = `https://tracker.shadowfax.in/track?orderid=${awb}`;
    } else if (newOrder.courierPartner === "XpressBees") {
      liveTracking = `https://www.xpressbees.com/track?tracking_no=${awb}`;
    } else if (newOrder.courierPartner === "Ecom Express") {
      liveTracking = `https://ecomexpress.in/${awb}`;
    }

    // ✅ Store order in Firestore
    await addDoc(collection(db, "orders"), {
      ...newOrder,
      liveTracking,
      createdAt: new Date(),
      createdBy: user?.email || "Unknown",
    });

    alert("✅ Order added successfully!");
    setNewOrder({
      orderId: "",
      sku: "",
      quantity: "",
      courierPartner: "",
      awbNumber: "",
      dispatchDate: "",
      status: "Not Dispatched",
      liveTracking: "",
      notes: "In Transit",
      assignedTo: "",
    });
    fetchOrders();
  };

  // 🟠 Update order
  const handleUpdateOrder = async (id, updatedFields) => {
    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, updatedFields);
    alert("✅ Order updated!");
    setEditingId(null);
    fetchOrders();
  };

  // 🔴 Delete order
  const handleDeleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteDoc(doc(db, "orders", id));
      alert("🗑️ Order deleted!");
      fetchOrders();
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
      <h2>📦 Order Management</h2>

      {/* 🆕 Add New Order */}
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
            placeholder="Order ID"
            value={newOrder.orderId}
            onChange={(e) =>
              setNewOrder((prev) => ({ ...prev, orderId: e.target.value }))
            }
          />
          <input
            placeholder="SKU"
            value={newOrder.sku}
            onChange={(e) =>
              setNewOrder((prev) => ({ ...prev, sku: e.target.value }))
            }
          />
          <input
            placeholder="Quantity"
            value={newOrder.quantity}
            onChange={(e) =>
              setNewOrder((prev) => ({ ...prev, quantity: e.target.value }))
            }
          />
          <select
            placeholder="Courier Partner"
            value={newOrder.courierPartner}
            onChange={(e) =>
              setNewOrder((prev) => ({
                ...prev,
                courierPartner: e.target.value,
              }))
            }
          >
            <option value="">Select Courier Partner</option>
            <option value="Delhivery">Delhivery</option>
            <option value="Shadowfax">Shadowfax</option>
            <option value="XpressBees">XpressBees</option>
            <option value="Ecom Express">Ecom Express</option>
          </select>
          <input
            placeholder="AWB Number"
            value={newOrder.awbNumber}
            onChange={(e) =>
              setNewOrder((prev) => ({ ...prev, awbNumber: e.target.value }))
            }
          />
          {/* 📅 Dispatch Date */}
          <input
            type="date"
            value={newOrder.dispatchDate}
            onChange={(e) =>
              setNewOrder((prev) => ({
                ...prev,
                dispatchDate: e.target.value,
              }))
            }
          />
          {/* 🔽 Status */}
          <select
            value={newOrder.status}
            onChange={(e) =>
              setNewOrder((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="Dispatched">Dispatched</option>
            <option value="Not Dispatched">Not Dispatched</option>
          </select>
          {/* 🔽 Notes */}
          <select
            value={newOrder.notes}
            onChange={(e) =>
              setNewOrder((prev) => ({ ...prev, notes: e.target.value }))
            }
          >
            <option value="Delivered">Delivered</option>
            <option value="Customer Return">Customer Return</option>
            <option value="In Transit">In Transit</option>
            <option value="RTO">RTO</option>
          </select>

          {/* 👤 Assign To */}
          <select
            value={newOrder.assignedTo}
            onChange={(e) =>
              setNewOrder((prev) => ({ ...prev, assignedTo: e.target.value }))
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
            onClick={handleAddOrder}
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
            ➕ Add Order
          </button>
        </div>
      )}

      {/* 🧾 Orders Table */}
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
            <th style={thStyle}>Assigned To</th>
            <th style={thStyle}>Tracking</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
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

              {/* Assigned user */}
              <td style={tdStyle}>
                {editingId === order.id ? (
                  <select
                    defaultValue={order.assignedTo}
                    onChange={(e) =>
                      handleUpdateOrder(order.id, { assignedTo: e.target.value })
                    }
                  >
                    <option value={order.assignedTo}>{order.assignedTo}</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.email}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  order.assignedTo
                )}
              </td>


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
                  <button
                    onClick={() => setEditingId(null)}
                    style={btnCancel}
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingId(order.id)}
                    style={btnEdit}
                  >
                    Edit
                  </button>
                )}
                {(user?.role === "Manager" || user?.role === "Admin") && (
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
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
