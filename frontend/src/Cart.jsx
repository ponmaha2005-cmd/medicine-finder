import { useState } from "react";

const API = "http://127.0.0.1:8000/api";

export default function Cart({ cart, setCart, user, onNeedLogin, onOrdered }) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const changeQty = (index, delta) => {
    setCart((c) =>
      c
        .map((item, i) => (i === index ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const placeOrder = async () => {
    setError("");
    if (!user) {
      onNeedLogin();
      return;
    }
    if (!address.trim()) {
      setError("Please enter a delivery address");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/orders/place/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${user.token}`,
        },
        body: JSON.stringify({
          address,
          items: cart.map((i) => ({ medicine: i.medicine, shop: i.shop, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not place order");
      } else {
        setCart([]);
        onOrdered();
      }
    } catch {
      setError("Server not reachable. Is Django running?");
    }
    setLoading(false);
  };

  if (cart.length === 0) {
    return <p className="note">Your cart is empty. Search a medicine and tap Add 🛒</p>;
  }

  return (
    <div className="card">
      <h3>Your Cart</h3>
      {cart.map((item, i) => (
        <div className="shop" key={item.medicine + item.shop}>
          <div>
            <b>{item.medicine}</b>
            <small>{item.shop} · ₹{item.price}</small>
          </div>
          <div className="qty">
            <button onClick={() => changeQty(i, -1)}>−</button>
            <span>{item.quantity}</span>
            <button onClick={() => changeQty(i, 1)}>+</button>
          </div>
        </div>
      ))}
      <div className="total">
        <span>Total</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
      <textarea
        className="address"
        placeholder="Delivery address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        rows={3}
      />
      {error && <p className="error">{error}</p>}
      <button className="gold-btn" onClick={placeOrder} disabled={loading}>
        {loading ? "Placing order..." : user ? "Place Order (Demo)" : "Sign in to order"}
      </button>
      <p className="disclaimer">Demo order. No real payment or delivery.</p>
    </div>
  );
}