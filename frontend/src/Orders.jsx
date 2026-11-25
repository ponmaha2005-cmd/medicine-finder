import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

export default function Orders({ user, onNeedLogin }) {
  const [orders, setOrders] = useState([]);
  const [billId, setBillId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`${API}/orders/`, {
          headers: { Authorization: `Token ${user.token}` },
        });
        const data = await res.json();
        if (!alive) return;
        if (res.ok) setOrders(data);
        else setError("Could not load orders");
      } catch {
        if (alive) setError("Server not reachable. Is Django running?");
      }
    };
    load();
    const timer = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [user]);

  if (!user) {
    return (
      <div className="card">
        <p className="note">Please sign in to see your orders.</p>
        <button className="gold-btn" onClick={onNeedLogin}>Sign in</button>
      </div>
    );
  }

  const bill = orders.find((o) => o.id === billId);

  if (bill) {
    return (
      <div className="card bill">
        <button className="gold-btn no-print" onClick={() => window.print()}>
          🖨️ Print / Save as PDF
        </button>
        <p className="link no-print" onClick={() => setBillId(null)}>← Back to orders</p>
        <h2>MediRoyal</h2>
        <p className="generic">Invoice #{bill.id} · {bill.created_at}</p>
        <p>
          <b>{bill.customer}</b>
          <br />
          {bill.email}
          <br />
          {bill.address}
        </p>
        <table>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Shop</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((it, i) => (
              <tr key={i}>
                <td>{it.medicine}</td>
                <td>{it.shop}</td>
                <td>{it.quantity}</td>
                <td>₹{(it.price * it.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="total">
          <span>Total</span>
          <span>₹{bill.total.toFixed(2)}</span>
        </div>
        <p className="disclaimer">Demo invoice with sample data. Not a real bill.</p>
      </div>
    );
  }

  return (
    <div>
      {error && <p className="note">{error}</p>}
      {orders.length === 0 && !error && <p className="note">No orders yet.</p>}
      {orders.map((o) => (
        <div className="card" key={o.id}>
          <h3>Order #{o.id}</h3>
          <p className="generic">{o.created_at}</p>
          {o.items.map((it, i) => (
            <div className="shop" key={i}>
              <div>
                <b>{it.medicine} × {it.quantity}</b>
                <small>{it.shop}</small>
              </div>
              <div className="price">₹{(it.price * it.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div className="total">
            <span>Total</span>
            <span>₹{o.total.toFixed(2)}</span>
          </div>

          <div className="tracker">
            {o.steps.map((label, i) => (
              <div className={`step ${i <= o.step ? "done" : ""}`} key={label}>
                <div className="dot">{i <= o.step ? "✓" : ""}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <button className="gold-btn" onClick={() => setBillId(o.id)}>View Bill</button>
        </div>
      ))}
    </div>
  );
}