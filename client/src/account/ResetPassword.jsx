import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL + "/api/users";

function ResetPassword() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const email = searchParams.get("email") || "";
    const otp = searchParams.get("otp") || "";

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!email || !otp) {
            setError("Invalid password reset request.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            const response = await fetch(
                `${API_URL}/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        otp: otp,
                        password: formData.password,
                        confirmPassword: formData.confirmPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to reset password."
                );
            }

            setSuccess(
                "Password reset successfully. Redirecting to login..."
            );

            setFormData({
                password: "",
                confirmPassword: ""
            });

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="account-page">

            <button
                type="button"
                className="back-button"
                onClick={() => navigate(-1)}
            >
                ? Back
            </button>

            <section className="account-card">

                <p className="section-label">
                    ACCOUNT RECOVERY
                </p>

                <h1>
                    Reset Password
                </h1>

                <p>
                    Create a new password for your account.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="account-form"
                >

                    <div className="form-group">

                        <label htmlFor="password">
                            New Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label htmlFor="confirmPassword">
                            Confirm New Password
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />

                    </div>

                    {error && (
                        <p
                            className="form-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    {success && (
                        <p
                            className="auth-success"
                            role="status"
                        >
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Resetting..."
                            : "Reset Password"}
                    </button>

                </form>

                <p className="account-switch">

                    <Link
                        to="/login"
                        className="account-link"
                    >
                        Back to Login
                    </Link>

                </p>

            </section>

        </main>
    );
}

export default ResetPassword;

