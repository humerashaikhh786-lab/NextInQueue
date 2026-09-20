import { Link, useNavigate } from "react-router-dom";
import "./Settings.css";

function Settings() {
    const navigate = useNavigate();

    return (
        <main className="settings-page">
            <button
                type="button"
                className="settings-back-button"
                onClick={() => navigate(-1)}
            >
                <span>?</span>
                Back
            </button>

            <header className="settings-hero">
                <div className="settings-eyebrow">
                    <span className="settings-eyebrow-line"></span>
                    PREFERENCES
                </div>

                <h1>Settings</h1>

                <p>
                    Customize your NextInQueue experience and manage your
                    account preferences.
                </p>
            </header>

            <div className="settings-layout">

                <aside className="settings-sidebar">
                    <div className="settings-sidebar-title">
                        SETTINGS
                    </div>

                    <a href="#appearance" className="settings-sidebar-link active">
                        <span>?</span>
                        Appearance
                    </a>

                    <a href="#account" className="settings-sidebar-link">
                        <span>?</span>
                        Account
                    </a>

                    <a href="#security" className="settings-sidebar-link">
                        <span>?</span>
                        Security
                    </a>
                </aside>

                <div className="settings-content">

                    <section id="appearance" className="settings-group">
                        <div className="settings-group-heading">
                            <div>
                                <span className="settings-group-label">
                                    APPEARANCE
                                </span>
                                <h2>Make it yours</h2>
                                <p>
                                    Personalize the way NextInQueue looks and feels.
                                </p>
                            </div>
                        </div>

                        <div className="settings-feature-card">
                            <div className="settings-feature-icon theme-icon">
                                ?
                            </div>

                            <div className="settings-card-info">
                                <span className="settings-card-kicker">
                                    INTERFACE
                                </span>

                                <h3>Theme</h3>

                                <p>
                                    Choose the visual style that fits your
                                    entertainment experience.
                                </p>

                                <span className="settings-current">
                                    <span className="settings-status-dot"></span>
                                    Dark Cinematic
                                </span>
                            </div>

                            <Link
                                to="/settings/theme"
                                className="settings-action-button"
                            >
                                Manage Theme
                                <span>?</span>
                            </Link>
                        </div>
                    </section>

                    <section id="account" className="settings-group">
                        <div className="settings-group-heading">
                            <div>
                                <span className="settings-group-label">
                                    ACCOUNT
                                </span>
                                <h2>Your account</h2>
                                <p>
                                    Manage your personal account information.
                                </p>
                            </div>
                        </div>

                        <div className="settings-feature-card">
                            <div className="settings-feature-icon profile-icon">
                                ?
                            </div>

                            <div className="settings-card-info">
                                <span className="settings-card-kicker">
                                    PERSONAL
                                </span>

                                <h3>Profile</h3>

                                <p>
                                    View and manage your account information,
                                    profile details and preferences.
                                </p>
                            </div>

                            <Link
                                to="/profile"
                                className="settings-action-button"
                            >
                                View Profile
                                <span>?</span>
                            </Link>
                        </div>
                    </section>

                    <section id="security" className="settings-group">
                        <div className="settings-group-heading">
                            <div>
                                <span className="settings-group-label">
                                    SECURITY
                                </span>
                                <h2>Keep it secure</h2>
                                <p>
                                    Manage your account security and password.
                                </p>
                            </div>
                        </div>

                        <div className="settings-feature-card">
                            <div className="settings-feature-icon security-icon">
                                ?
                            </div>

                            <div className="settings-card-info">
                                <span className="settings-card-kicker">
                                    PASSWORD
                                </span>

                                <h3>Password</h3>

                                <p>
                                    Change your password and keep your
                                    NextInQueue account secure.
                                </p>
                            </div>

                            <Link
                                to="/forgot-password"
                                className="settings-action-button"
                            >
                                Change Password
                                <span>?</span>
                            </Link>
                        </div>
                    </section>

                    <div className="settings-footer-note">
                        <span>?</span>
                        More personalization options will be added to
                        NextInQueue over time.
                    </div>

                </div>
            </div>
        </main>
    );
}

export default Settings;

