import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

const API_URL = "${VITE_API_URL}/api/users";

function VerifyOTP() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const email = searchParams.get("email") || "";
    const purpose = searchParams.get("purpose") || "";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!email) {
            setError("Email address is missing.");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        if (
            purpose !== "REGISTRATION" &&
            purpose !== "PASSWORD_RESET"
        ) {
            setError("Invalid verification request.");
            return;
        }

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                `${API_URL}/verify-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        otp: otp,
                        purpose: purpose
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "OTP verification failed."
                );
            }

            if (purpose === "REGISTRATION") {

                navigate("/login");

                return;
            }

            navigate(
                `/reset-password?email=${encodeURIComponent(
                    email
                )}&otp=${encodeURIComponent(otp)}`
            );

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
                ← Back
            </button>

            <section className="account-card">

                <p className="section-label">
                    ACCOUNT RECOVERY
                </p>

                <h1>
                    Verify OTP
                </h1>

                <p>
                    Enter the 6-digit OTP sent to your registered email address.
                </p>

                {email && (
                    <p>
                        Code sent to: {email}
                    </p>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="account-form"
                >

                    <div className="form-group">

                        <label htmlFor="otp">
                            OTP
                        </label>

                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(event) => {
                                const value =
                                    event.target.value.replace(/\D/g, "");

                                setOtp(value);
                                setError("");
                            }}
                            placeholder="Enter 6-digit OTP"
                            autoComplete="one-time-code"
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
                            ? "Verifying..."
                            : "Verify OTP"}
                    </button>

                </form>

                <p className="account-switch">

                    <Link
                        to={
                            purpose === "REGISTRATION"
                                ? "/create-account"
                                : "/forgot-password"
                        }
                        className="account-link"
                    >
                        Request a new OTP
                    </Link>

                </p>

            </section>

        </main>
    );
}

export default VerifyOTP;

