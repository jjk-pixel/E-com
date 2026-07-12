import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          Meridien<span className="brand-mark">.</span>
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/">Catalogue</Link>
          </li>
          <li>
            <Link to="/cart">
              Panier
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/orders">Mes commandes</Link>
              </li>
              <li>
                <button className="btn btn-outline" onClick={handleLogout}>
                  Deconnexion
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="btn btn-outline">
                Connexion
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
