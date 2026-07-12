import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="eyebrow">Creer un compte</div>
      <h1 className="h-display" style={{ fontSize: 32, margin: "8px 0 26px" }}>
        Rejoins Meridien.
      </h1>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="fullName">Nom complet</label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p style={{ fontSize: 12, color: "var(--color-ink-soft)", marginTop: 6 }}>
            8 caracteres minimum.
          </p>
        </div>
        <button className="btn btn-block" type="submit" disabled={loading}>
          {loading ? "Creation..." : "Creer mon compte"}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 14, color: "var(--color-ink-soft)" }}>
        Deja un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}
