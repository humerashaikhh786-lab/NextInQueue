import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL + "/api/users";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Invalid email or password."
                );
            }

            login(data);
            navigate("/");

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const continueAsGuest = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    return (
        <div className="auth-page">

            <div className="auth-branding">

                <div className="auth-logo">
                    NextInQueue
                </div>

                <div className="auth-tagline">
                    Your next story starts here.
                </div>

                <p className="auth-description">
                    Discover movies, binge-worthy series and anime,
                    build your personal queue, and never lose track
                    of what you want to watch next.
                </p>

                <div className="auth-highlights">

                    <div className="auth-highlight">
                        <span>+</span>
                        <div>
                            <strong>Discover</strong>
                            <small>Find something worth watching.</small>
                        </div>
                    </div>

                    <div className="auth-highlight">
                        <span>+</span>
                        <div>
                            <strong>Save Your Favorites</strong>
                            <small>Keep everything you love in one place.</small>
                        </div>
                    </div>

                    <div className="auth-highlight">
                        <span>+</span>
                        <div>
                            <strong>Build Your Queue</strong>
                            <small>Always know what you're watching next.</small>
                        </div>
                    </div>

                </div>

            </div>

            <div className="auth-card">

                <div className="auth-card-heading">

                    <span className="auth-eyebrow">
                        WELCOME TO NEXTINQUEUE
                    </span>

                    <h1>
                        Welcome Back
                    </h1>

                    <p>
                        Pick up where you left off
                        and continue your entertainment journey.
                    </p>

                </div>

                <form onSubmit={handleSubmit}>

                    <label>
                        Email Address
                    </label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <div className="forgot-password-row">
                        <Link to="/forgot-password">
                            Forgot password?
                        </Link>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="primary-button auth-login-button"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>

                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <button
                    type="button"
                    className="guest-button"
                    onClick={continueAsGuest}
                >
                    Continue as Guest
                </button>

                <p className="auth-create-text">
                    New to NextInQueue?{" "}
                    <Link to="/create-account">
                        Create an account
                    </Link>
                </p>

                <p className="auth-small-text">
                    Create your personal entertainment space
                    and keep your watchlist with you wherever you go.
                </p>

            </div>

        </div>
    );
}

export default Login;


