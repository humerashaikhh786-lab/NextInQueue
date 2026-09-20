import { useNavigate } from "react-router-dom";
import "./Library.css";

function History() {
    const navigate = useNavigate();

    return (
        <main className="library-page library-subpage">
            <button
                type="button"
                className="library-back-button"
                onClick={() => navigate(-1)}
            >
                <span>←</span>
                Back
            </button>

            <header className="library-subpage-hero">
                <span className="library-eyebrow">YOUR LIBRARY</span>
                <h1>History</h1>
                <p>
                    Revisit movies, TV series, and anime you've recently explored.
                </p>
            </header>

            <section className="library-results-panel">
                <div className="library-results-heading">
                    <div>
                        <span className="library-card-label">RECENTLY VIEWED</span>
                        <h2>Viewing History</h2>
                    </div>

                    <span className="library-result-count">0 TITLES</span>
                </div>

                <div className="library-empty-state">
                    <div className="library-empty-icon history-empty">◷</div>
                    <h3>Your history is empty</h3>
                    <p>
                        Content you explore will appear here so you can
                        quickly find it again.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/explore")}
                        className="library-empty-button"
                    >
                        Start Exploring
                        <span>→</span>
                    </button>
                </div>
            </section>
        </main>
    );
}

export default History;
