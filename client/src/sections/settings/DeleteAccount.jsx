import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import "./DeleteAccount.css";

const API_URL = "http://localhost:8080/api/users";

function DeleteAccount() {

    const navigate = useNavigate();
    const { logout } = useAuth();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [step, setStep] = useState("email");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const handleSendOtp = async (event) => {

        event.preventDefault();

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail) {
            setError("Please enter your email address.");
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_URL}/delete-account/request`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        email: cleanEmail
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
                    "Unable to send the account deletion OTP."
                );
            }

            setEmail(cleanEmail);
            setStep("otp");

            setSuccess(
                "A verification OTP has been sent to your email address."
            );

        } catch (error) {

            setError(
                error.message ||
                "Unable to send the account deletion OTP."
            );

        } finally {

            setLoading(false);
        }
    };

    const handleDeleteAccount = async (event) => {

        event.preventDefault();

        if (!otp.trim()) {
            setError("Please enter the OTP.");
            return;
        }

        if (otp.trim().length !== 6) {
            setError("OTP must contain 6 digits.");
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_URL}/delete-account/confirm`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        otp: otp.trim()
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
                    "Unable to delete your account."
                );
            }

            setSuccess(
                "Your account has been successfully deleted."
            );

            logout();


            setTimeout(() => {
                navigate("/login");
            }, 1800);

        } catch (error) {

            setError(
                error.message ||
                "Unable to delete your account."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <main className="delete-account-page">

            <button
                type="button"
                className="delete-account-back-button"
                onClick={() => navigate(-1)}
            >
                <span>←</span>
                Back
            </button>

            <section className="delete-account-card">

                <div className="delete-account-icon">
                    !
                </div>

                <span className="delete-account-label">
                    DANGER ZONE
                </span>

                <h1>
                    Delete Account
                </h1>

                <p className="delete-account-description">
                    Permanently remove your NextInQueue account and all
                    associated personal data.
                </p>

                {step === "email" && (
                    <form
                        className="delete-account-form"
                        onSubmit={handleSendOtp}
                    >

                        <div className="delete-account-warning">
                            <strong>This action is permanent.</strong>
                            <span>
                                Your account, watchlist, favourites and
                                associated data will be permanently deleted.
                            </span>
                        </div>

                        <div className="delete-account-form-group">

                            <label htmlFor="delete-account-email">
                                Confirm your email
                            </label>

                            <input
                                id="delete-account-email"
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
                                className="delete-account-error"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        {success && (
                            <p
                                className="delete-account-success"
                                role="status"
                            >
                                {success}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="delete-account-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Sending OTP..."
                                : "Send Verification OTP"}
                        </button>

                    </form>
                )}

                {step === "otp" && (
                    <form
                        className="delete-account-form"
                        onSubmit={handleDeleteAccount}
                    >

                        <div className="delete-account-otp-message">
                            <strong>Check your email</strong>
                            <span>
                                Enter the 6-digit OTP sent to{" "}
                                <b>{email}</b>.
                            </span>
                        </div>

                        <div className="delete-account-form-group">

                            <label htmlFor="delete-account-otp">
                                Verification OTP
                            </label>

                            <input
                                id="delete-account-otp"
                                type="text"
                                inputMode="numeric"
                                maxLength="6"
                                value={otp}
                                onChange={(event) => {
                                    const value =
                                        event.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6);

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
                                className="delete-account-error"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        {success && (
                            <p
                                className="delete-account-success"
                                role="status"
                            >
                                {success}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="delete-account-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Deleting Account..."
                                : "Permanently Delete Account"}
                        </button>

                        <button
                            type="button"
                            className="delete-account-secondary-button"
                            onClick={() => {
                                setStep("email");
                                setOtp("");
                                setError("");
                                setSuccess("");
                            }}
                            disabled={loading}
                        >
                            Change Email
                        </button>

                    </form>
                )}

                <p className="delete-account-note">
                    Your account can only be deleted after verifying
                    ownership through the OTP sent to your registered email.
                </p>

            </section>

        </main>
    );
}

export default DeleteAccount;




