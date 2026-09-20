import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
    const location = useLocation();
    const { user } = useAuth();

    const navItems = [
        { label: "Home", path: "/" },
        { label: "Movies", path: "/movies" },
        { label: "TV Series", path: "/series" },
        { label: "Anime", path: "/anime" }
    ];

    function openHomeSearch() {
        if (location.pathname === "/") {
            window.dispatchEvent(
                new CustomEvent("nextinqueue-open-search")
            );
        } else {
            window.location.href = "/";
            setTimeout(() => {
                window.dispatchEvent(
                    new CustomEvent("nextinqueue-open-search")
                );
            }, 100);
        }
    }

    return (
        <header className="nq-navbar">
            <Link to="/" className="nq-logo">
                <span>Next</span>InQueue
            </Link>

            <nav className="nq-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={
                            location.pathname === item.path
                                ? "active"
                                : ""
                        }
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="nq-nav-actions">
                <button
                    className="nq-search-button"
                    onClick={openHomeSearch}
                    aria-label="Search"
                >
                    ?
                </button>

                {user ? (
                    <Link
                        to="/profile"
                        className="nq-profile-button"
                    >
                        {user.name
                            ? user.name.charAt(0).toUpperCase()
                            : "U"}
                    </Link>
                ) : (
                    <Link
                        to="/login"
                        className="nq-login-button"
                    >
                        Login
                    </Link>
                )}
            </div>
        </header>
    );
}

