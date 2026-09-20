import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL + "/api/users";

function CreateAccount() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });

        setError("");
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        try {

            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to create account."
                );
            }

            setSuccess(
                "Verification OTP sent to your email address. Redirecting..."
            );

            setTimeout(() => {
                navigate(
                    `/verify-otp?email=${encodeURIComponent(form.email)}&purpose=REGISTRATION`
                );
            }, 1200);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-branding">

                <div className="auth-logo">
                    NextInQueue
                </div>

                <div className="auth-tagline">
                    Your watchlist.
                    Your world.
                </div>

                <p className="auth-description">
                    Create your personal entertainment space.
                    Save what you love, organize what you want
                    to watch, and keep your queue with you wherever
                    you go.
                </p>

                <div className="auth-highlights">

                    <div className="auth-highlight">
                        <span>+</span>
                        <div>
                            <strong>One Place For Everything</strong>
                            <small>
                                Movies, series and anime together.
                            </small>
                        </div>
                    </div>

                    <div className="auth-highlight">
                        <span>+</span>
                        <div>
                            <strong>Personal Library</strong>
                            <small>
                                Queue, favorites, watched and history.
                            </small>
                        </div>
                    </div>

                    <div className="auth-highlight">
                        <span>+</span>
                        <div>
                            <strong>Your Account, Everywhere</strong>
                            <small>
                                Keep your entertainment library synced.
                            </small>
                        </div>
                    </div>

                </div>

            </div>

            <div className="auth-card">

                <div className="auth-card-heading">

                    <span className="auth-eyebrow">
                        JOIN NEXTINQUEUE
                    </span>

                    <h1>
                        Create Account
                    </h1>

                    <p>
                        Start building your personal entertainment
                        universe today.
                    </p>

                </div>

                <form onSubmit={handleSubmit}>

                    <label>
                        Full Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

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
                        placeholder="Create a password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <label>
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="auth-success">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="primary-button auth-login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Sending OTP..."
                            : "Create Account"}
                    </button>

                </form>

                <div className="auth-divider">
                    <span>ALREADY A MEMBER?</span>
                </div>

                <p className="auth-create-text">
                    Already have an account?{" "}
                    <Link to="/login">
                        Sign in
                    </Link>
                </p>

                <p className="auth-small-text">
                    Your personal library will be available
                    whenever you sign in.
                </p>

            </div>

        </div>
    );
}

export default CreateAccount;

