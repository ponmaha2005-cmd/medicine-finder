import { useState } from "react";
import Logo from "./Logo";
import Auth from "./Auth";
import Cart from "./Cart";
import Orders from "./Orders";

const API = "http://127.0.0.1:8000/api";

function groupSearch(rows) {
  const map = {};
  rows.forEach((r) => {
    if (!map[r.medicine]) {
      map[r.medicine] = { medicine: r.medicine, generic: r.generic, shops: [] };
    }
    if (r.in_stock) {
      map[r.medicine].shops.push({ shop: r.shop, area: r.area, price: r.price });
    }
  });
  return Object.values(map);
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const resetParams = params.get("uid")
    ? { uid: params.get("uid"), token: params.get("token") }
    : null;

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [showAuth, setShowAuth] = useState(!!resetParams);
  const [view, setView] = useState("home");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");

  const handleLogin = (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    setShowAuth(false);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setView("home");
  };

  const search = async () => {
    if (!query.trim()) return;
    setView("home");
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/search/?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const grouped = groupSearch(data);
      setResults(grouped);
      if (grouped.length === 0) setMessage("No medicines found");
    } catch {
      setMessage("Server not reachable. Is Django running?");
    }
    setLoading(false);
  };

  const scan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setView("home");
    setLoading(true);
    setMessage("");
    const form = new FormData();
    form.append("image", file);
    try {
      const res = await fetch(`${API}/scan/`, { method: "POST", body: form });
      const data = await res.json();
      setResults(data.medicines || []);
      if (!data.medicines || data.medicines.length === 0) {
        setMessage("No medicines found in this image");
      }
    } catch {
      setMessage("Server not reachable. Is Django running?");
    }
    setLoading(false);
    e.target.value = "";
  };

  const addToCart = (medicine, s) => {
    setCart((c) => {
      const found = c.find((i) => i.medicine === medicine && i.shop === s.shop);
      if (found) {
        return c.map((i) => (i === found ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...c, { medicine, shop: s.shop, price: s.price, quantity: 1 }];
    });
    setToast(`${medicine} added to cart`);
    setTimeout(() => setToast(""), 1500);
  };

  const goHome = () => {
    setView("home");
    setResults([]);
    setQuery("");
    setMessage("");
    window.scrollTo(0, 0);
  };

  const cartCount = cart.reduce((n, i) => n + i.quantity, 0);

  if (showAuth) {
    return (
      <Auth
        onLogin={handleLogin}
        onSkip={() => setShowAuth(false)}
        resetParams={resetParams}
      />
    );
  }

  return (
    <div className="app">
      <header className="no-print">
        <Logo />
        {user && <p className="hello">Hi, {user.name} 👋</p>}
        <div className="searchbar">
          <input
            placeholder="Search medicine..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button onClick={search} title="Search">🔍</button>
          <label title="Take photo">
            📷
            <input type="file" accept="image/*" capture="environment" hidden onChange={scan} />
          </label>
          <label title="Scan prescription">
            🧾
            <input type="file" accept="image/*" hidden onChange={scan} />
          </label>
        </div>
      </header>

      <main>
        {view === "home" && (
          <>
            {loading && <p className="note">Searching...</p>}
            {message && <p className="note">{message}</p>}

            {results.map((m) => (
              <div className="card" key={m.medicine}>
                <h3>{m.medicine}</h3>
                <p className="generic">{m.generic}</p>
                {m.shops.length === 0 && <p className="note">Out of stock everywhere</p>}
                {m.shops.map((s, i) => (
                  <div className="shop" key={s.shop}>
                    <div>
                      <b>{s.shop}</b>
                      <small>{s.area}</small>
                    </div>
                    <div className="price">
                      {i === 0 && <span className="badge">Best Price</span>}
                      ₹{s.price}
                      <button className="add-btn" onClick={() => addToCart(m.medicine, s)}>
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <p className="disclaimer">
              Demo project with sample data. For information only. Please ask a pharmacist before buying medicines.
            </p>
          </>
        )}

        {view === "cart" && (
          <Cart
            cart={cart}
            setCart={setCart}
            user={user}
            onNeedLogin={() => setShowAuth(true)}
            onOrdered={() => setView("orders")}
          />
        )}

        {view === "orders" && (
          <Orders user={user} onNeedLogin={() => setShowAuth(true)} />
        )}

        {view === "menu" && (
          <div className="card">
            <h3>Menu</h3>
            <p className="link" onClick={() => setView("orders")}>📦 My Orders</p>
            <p className="link" onClick={goHome}>🏠 Home</p>
            {user && <p className="link" onClick={logout}>🚪 Logout</p>}
          </div>
        )}
      </main>

      {toast && <div className="toast no-print">{toast}</div>}

      <nav className="no-print">
        <button onClick={goHome}>🏠<span>Home</span></button>
        <button onClick={() => (user ? logout() : setShowAuth(true))}>
          👤<span>{user ? "Logout" : "Sign in"}</span>
        </button>
        <button onClick={() => setView("cart")}>
          🛒<span>Cart{cartCount > 0 ? ` (${cartCount})` : ""}</span>
        </button>
        <button onClick={() => setView("menu")}>☰<span>Menu</span></button>
      </nav>
    </div>
  );
}