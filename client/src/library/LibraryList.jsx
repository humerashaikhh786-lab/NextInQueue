import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Library.css";

const API_BASE = "http://localhost:8080";

function LibraryList({
    type,
    title,
    description,
    emptyTitle,
    emptyText,
    icon,
    emptyClass = ""
}) {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadLibrary = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/library`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                navigate("/login"); return;
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                setItems(
                    data.filter(item => item.itemType === type)
                );
            }
        } catch (error) {
            console.error("Library loading error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLibrary();

        const refreshLibrary = () => {
            loadLibrary();
        };

        window.addEventListener(
            "nextinqueue-library-updated",
            refreshLibrary
        );

        return () => {
            window.removeEventListener(
                "nextinqueue-library-updated",
                refreshLibrary
            );
        };
    }, [type]);

    const openDetails = (item) => {
        if (item.mediaType === "anime") {
            navigate(`/anime/${item.tmdbId}`);
        } else if (item.mediaType === "series") {
            navigate(`/series/${item.tmdbId}`);
        } else {
            navigate(`/movie/${item.tmdbId}`);
        }
    };

    return (
        <main className="library-page library-subpage">

            <button
                type="button"
                className="library-back-button"
                onClick={() => navigate(-1)}
            >
                {"\u2190"} Back
            </button>

            <header className="library-subpage-hero">
                <span className="library-eyebrow">
                    YOUR LIBRARY
                </span>

                <h1>{title}</h1>

                <p>{description}</p>
            </header>

            <section className="library-results-panel">

                <div className="library-results-heading">
                    <div>
                        <span className="library-card-label">
                            YOUR COLLECTION
                        </span>

                        <h2>{title}</h2>
                    </div>

                    <span className="library-result-count">
                        {items.length} {items.length === 1 ? "TITLE" : "TITLES"}
                    </span>
                </div>

                {loading ? (
                    <div className="library-empty-state">
                        <h3>Loading...</h3>
                    </div>
                ) : items.length === 0 ? (
                    <div className="library-empty-state">
                        <div className={`library-empty-icon ${emptyClass}`}>
                            {icon}
                        </div>

                        <h3>{emptyTitle}</h3>

                        <p>{emptyText}</p>

                        <Link
                            to="/explore"
                            className="library-empty-button"
                        >
                            Start Exploring
                            <span>{"\u2192"}</span>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="library-title-grid">
                            {items.map(item => (
                                <article
                                    className="library-title-card"
                                    key={item.id}
                                >
                                    <button
                                        type="button"
                                        className="library-poster-button"
                                        onClick={() => openDetails(item)}
                                    >
                                        {item.posterPath ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                                                alt={item.title}
                                            />
                                        ) : (
                                            <div className="library-poster-placeholder">
                                                {icon}
                                            </div>
                                        )}
                                    </button>

                                    <div className="library-title-info">
                                        <h3>{item.title}</h3>

                                        <span>
                                            {item.mediaType === "anime"
                                                ? "Anime"
                                                : item.mediaType === "series"
                                                    ? "TV Series"
                                                    : "Movie"}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="library-explore-more">
                            <Link
                                to="/explore"
                                className="library-explore-more-button"
                            >
                                Explore More
                                <span>{"\u2192"}</span>
                            </Link>
                        </div>
                    </>
                )}

            </section>
        </main>
    );
}

export default LibraryList;



