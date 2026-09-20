import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL + "/api/users";

function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                `${API_URL}/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim()
                    })
                }
            );

            const responseText = await response.text();

            let data = {};

            if (responseText.trim()) {
                try {
                    data = JSON.parse(responseText);
                } catch {
                    data = {
                        message: responseText
                    };
                }
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    `Unable to send password reset OTP. Server returned ${response.status}.`
                );
            }

            navigate(
                `/verify-otp?email=${encodeURIComponent(
                    email.trim()
                )}&purpose=PASSWORD_RESET`
            );

        } catch (error) {

            setError(
                error.message ||
                "Unable to send password reset OTP."
            );

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
                    Forgot Password?
                </h1>

                <p>
                    Enter your registered email address and we'll send you a
                    one-time password to verify your account.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="account-form"
                >

                    <div className="form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setError("");
                            }}
                            placeholder="Enter your registered email"
                            autoComplete="email"
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

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Sending OTP..."
                            : "Send OTP"}
                    </button>

                </form>

                <p className="account-switch">

                    Remember your password?{" "}

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

export default ForgotPassword;
