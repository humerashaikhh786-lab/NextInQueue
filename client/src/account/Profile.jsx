import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../library/Library.css";

const API_BASE = "http://localhost:8080";

function Profile() {
    const navigate = useNavigate();
    const { user, logout, loading } = useAuth();

    const [libraryItems, setLibraryItems] = useState([]);

    useEffect(() => {
        const loadLibrary = async () => {
            const token = localStorage.getItem("token");

            if (!token) return;

            try {
                const response = await fetch(`${API_BASE}/api/library`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                if (Array.isArray(data)) {
                    setLibraryItems(data);
                }
            } catch (error) {
                console.error("Profile library count error:", error);
            }
        };

        loadLibrary();

        const refreshCounts = () => {
            loadLibrary();
        };

        window.addEventListener(
            "nextinqueue-library-updated",
            refreshCounts
        );

        return () => {
            window.removeEventListener(
                "nextinqueue-library-updated",
                refreshCounts
            );
        };
    }, []);

    if (loading) {
        return (
            <main className="profile-page">
                <button
                    type="button"
                    className="library-back-button"
                    onClick={() => navigate("/") }
                >
                    {"\u2190"} Back
                </button>

                <section className="library-hero">
                    <p className="library-eyebrow">ACCOUNT</p>
                    <h1>Loading Profile...</h1>
                    <p>Getting your account information.</p>
                </section>

            </main>
        );
    }

    if (!user) {
        return (
            <main className="profile-page">
                <button
                    type="button"
                    className="library-back-button"
                    onClick={() => navigate("/") }
                >
                    {"\u2190"} Back
                </button>

                <section className="library-hero">
                    <p className="library-eyebrow">ACCOUNT</p>
                    <h1>Login Required</h1>
                    <p>Please log in to view your profile.</p>

                    <Link to="/login" className="secondary-button">
                        Go to Login
                    </Link>
                </section>
            </main>
        );
    }

    const displayName = user.name || "User";
    const displayEmail = user.email || "";

    const queueCount = libraryItems.filter(
        item => item.itemType === "queue"
    ).length;

    const favoriteCount = libraryItems.filter(
        item => item.itemType === "favorite"
    ).length;

    const watchedCount = libraryItems.filter(
        item => item.itemType === "watched"
    ).length;

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <main className="profile-page">
            <button
                type="button"
                className="library-back-button"
                onClick={() => navigate("/") }
            >
                {"\u2190"} Back
            </button>

            <section className="profile-hero">
                <div className="profile-avatar">
                    {displayName.charAt(0).toUpperCase()}
                </div>

                <div className="profile-hero-content">
                    <p className="library-eyebrow">MY ACCOUNT</p>
                    <h1>{displayName}</h1>

                    <p className="profile-email">
                        {displayEmail}
                    </p>

                    <span className="profile-status">
                        Account Active
                    </span>
                </div>
            </section>

            <section className="profile-stats-grid">
                <Link to="/library/queue" className="profile-stat-card">
                    <span className="profile-stat-icon">Q</span>
                    <strong>{queueCount}</strong>
                    <span>In Queue</span>
                </Link>

                <Link to="/library/favorites" className="profile-stat-card">
                    <span className="profile-stat-icon">F</span>
                    <strong>{favoriteCount}</strong>
                    <span>Favorites</span>
                </Link>

                <Link to="/library/watched" className="profile-stat-card">
                    <span className="profile-stat-icon">W</span>
                    <strong>{watchedCount}</strong>
                    <span>Watched</span>
                </Link>

            </section>

            <section className="profile-section">
                <div className="profile-section-heading">
                    <div>
                        <p className="library-eyebrow">ACCOUNT DETAILS</p>
                        <h2>Your Information</h2>
                    </div>
                </div>

                <div className="profile-info-card">
                    <div className="profile-info-row">
                        <span>Name</span>
                        <strong>{displayName}</strong>
                    </div>

                    <div className="profile-info-row">
                        <span>Email</span>
                        <strong>{displayEmail}</strong>
                    </div>

                    {user.role && (
                        <div className="profile-info-row">
                            <span>Account Type</span>
                            <strong>{user.role}</strong>
                        </div>
                    )}
                </div>
            </section>

            <section className="profile-section">
                <div className="profile-section-heading">
                    <div>
                        <p className="library-eyebrow">QUICK ACCESS</p>
                        <h2>Manage Your Account</h2>
                    </div>
                </div>

                <div className="profile-actions-grid">
                    <Link to="/library" className="profile-action-card">
                        <span>{"\u25B6"}</span>

                        <div>
                            <strong>My Library</strong>
                            <small>
                                Manage your queue, favorites and watched content.
                            </small>
                        </div>

                        <b>{"\u2192"}</b>
                    </Link>

                    <Link to="/settings" className="profile-action-card">
                        <span>{"\u25B6"}</span>

                        <div>
                            <strong>Settings</strong>
                            <small>
                                Customize your NextInQueue experience.
                            </small>
                        </div>

                        <b>{"\u2192"}</b>
                    </Link>
                </div>
            </section>

            <section className="profile-section">
                <button
                    type="button"
                    className="profile-logout"
                    onClick={handleLogout}
                >
                    <span>{"\u25B6"}</span>

                    <div>
                        <strong>Logout</strong>
                        <small>Sign out of NextInQueue</small>
                    </div>

                    <b>{"\u2192"}</b>
                </button>
            </section>

            <section className="profile-section">
                <Link
                    to="/settings/delete-account"
                    className="profile-logout"
                >
                    <span>!</span>

                    <div>
                        <strong>Delete Account</strong>
                        <small>Permanently remove your account</small>
                    </div>

                    <b>{"\u2192"}</b>
                </Link>
            </section>
        </main>
    );
}

export default Profile;






