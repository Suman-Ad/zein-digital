import React, { useState } from "react";

export default function OrderManagement() {
  const [orders, setOrders] = useState([
    {
      orderId: "21237306629544448_1",
      sku: "PKB-PCH-KPJ-002",
      quantity: 1,
      courierPartner: "Delhivery",
      awbNumber: "1490819859515744",
      dispatchDate: "2025-10-22",
      status: "Dispatched",
      liveTracking: "https://www.delhivery.com/track/package/1490819859515744",
      notes: "Delivered",
    },
  ]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 Order Management</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
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
            <th style={thStyle}>Live Tracking</th>
            <th style={thStyle}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={tdStyle}>{order.orderId}</td>
              <td style={tdStyle}>{order.sku}</td>
              <td style={tdStyle}>{order.quantity}</td>
              <td style={tdStyle}>{order.courierPartner}</td>
              <td style={tdStyle}>{order.awbNumber}</td>
              <td style={tdStyle}>{order.dispatchDate}</td>
              <td style={tdStyle}>{order.status}</td>
              <td style={tdStyle}>
                <a
                  href={order.liveTracking}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Track
                </a>
              </td>
              <td style={tdStyle}>{order.notes}</td>
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
