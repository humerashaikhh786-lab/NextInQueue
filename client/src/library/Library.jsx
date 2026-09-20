import { Link, useNavigate } from "react-router-dom";
import "./Library.css";

function Library() {
    const navigate = useNavigate();

    return (
        <main className="library-page">
            <button
                type="button"
                className="library-back-button"
                onClick={() => navigate("/profile")}
            >
                <span>{"\u2190"}</span>
                Back
            </button>

            <header className="library-hero">
                <span className="library-eyebrow">
                    YOUR COLLECTION
                </span>

                <h1>My Library</h1>

                <p>
                    Everything you've saved, loved, watched, and explored {"\u2014"}
                    all in one place.
                </p>
            </header>

            <section className="library-main-grid">

                <Link to="/library/queue" className="library-main-card queue-card">
                    <div className="library-card-top">
                        <span className="library-big-icon">+</span>
                        <span className="library-card-arrow">{"\u2192"}</span>
                    </div>

                    <div>
                        <span className="library-card-label">WATCH LATER</span>
                        <h2>Queue</h2>
                        <p>
                            Titles you've saved for your next movie or series night.
                        </p>
                    </div>
                </Link>

                <Link to="/library/favorites" className="library-main-card favorites-card">
                    <div className="library-card-top">
                        <span className="library-big-icon">{"\u2665"}</span>
                        <span className="library-card-arrow">{"\u2192"}</span>
                    </div>

                    <div>
                        <span className="library-card-label">YOUR PICKS</span>
                        <h2>Favorites</h2>
                        <p>
                            Your personal collection of titles you love.
                        </p>
                    </div>
                </Link>

                <Link to="/library/watched" className="library-main-card watched-card">
                    <div className="library-card-top">
                        <span className="library-big-icon">{"\u2713"}</span>
                        <span className="library-card-arrow">{"\u2192"}</span>
                    </div>

                    <div>
                        <span className="library-card-label">COMPLETED</span>
                        <h2>Watched</h2>
                        <p>
                            Keep track of everything you've already watched.
                        </p>
                    </div>
                </Link>

            </section>

            <section className="library-bottom-panel">
                <div>
                    <span className="library-eyebrow">YOUR SPACE</span>
                    <h2>Your library is personal.</h2>
                    <p>
                        Your queue, favorites, watched titles, and
                        ratings will stay connected to your account across devices.
                    </p>
                </div>

                <Link to="/settings" className="library-settings-link">
                    Open Settings
                    <span>{"\u2192"}</span>
                </Link>
            </section>
        </main>
    );
}

export default Library;

