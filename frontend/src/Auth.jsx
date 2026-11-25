import { useState } from "react";
import Logo from "./Logo";

const API = "http://127.0.0.1:8000/api";
const TITLES = {
  login: "Sign in",
  register: "Create account",
  forgot: "Send reset link",
  reset: "Change password",
};
const PATHS = { login: "login", register: "register", forgot: "forgot", reset: "reset" };

export default function Auth({ onLogin, onSkip, resetParams }) {
  const [mode, setMode] = useState(resetParams ? "reset" : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    const body = mode === "reset" ? { ...resetParams, password: form.password } : form;
    try {
      const res = await fetch(`${API}/${PATHS[mode]}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else if (data.token) {
        onLogin(data);
      } else {
        setMsg(data.message);
        if (mode === "reset") {
          window.history.replaceState({}, "", "/");
          setMode("login");
        }
      }
    } catch {
      setError("Server not reachable. Is Django running?");
    }
    setLoading(false);
  };

  return (
    <div className="auth">
      <Logo />
      <form className="card" onSubmit={submit}>
        <h3>{mode === "forgot" ? "Forgot password" : TITLES[mode]}</h3>
        {mode === "register" && (
          <input name="name" placeholder="Full name" value={form.name} onChange={change} required />
        )}
        {mode !== "reset" && (
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
        )}
        {mode !== "forgot" && (
          <input
            name="password"
            type="password"
            placeholder={mode === "reset" ? "New password" : "Password"}
            minLength={6}
            value={form.password}
            onChange={change}
            required
          />
        )}
        {error && <p className="error">{error}</p>}
        {msg && <p className="success">{msg}</p>}
        <button className="gold-btn" disabled={loading}>
          {loading ? "Please wait..." : TITLES[mode]}
        </button>
        {mode === "login" && (
          <>
            <p className="link" onClick={() => setMode("forgot")}>Forgot password?</p>
            <p className="link" onClick={() => setMode("register")}>New here? Create account</p>
          </>
        )}
        {mode !== "login" && (
          <p className="link" onClick={() => setMode("login")}>Back to sign in</p>
        )}
      </form>
      <p className="link" onClick={onSkip}>Continue without signing in</p>
    </div>
  );
}