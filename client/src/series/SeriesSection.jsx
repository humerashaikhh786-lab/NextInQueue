import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MediaSection.css";

const API_BASE = "${VITE_API_URL}/api/tmdb";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";

export default function SeriesSection() {
    const [series, setSeries] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function loadSeries(nextPage = 1) {
        try {
            setError("");

            if (nextPage === 1) setLoading(true);
            else setLoadingMore(true);

            const response = await fetch(
                `${API_BASE}/popular/tv?page=${nextPage}`
            );

            if (!response.ok) {
                throw new Error("Failed to load TV series");
            }

            const data = await response.json();

            setSeries((previous) =>
                nextPage === 1
                    ? data.results || []
                    : [...previous, ...(data.results || [])]
            );

            setPage(nextPage);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    useEffect(() => {
        loadSeries(1);
    }, []);

    if (loading) {
        return (
            <div className="media-page-state">
                <div className="media-spinner"></div>
                <p>Loading TV series...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="media-page-state">
                <p>{error}</p>
                <button onClick={() => loadSeries(1)}>Try Again</button>
            </div>
        );
    }

    return (
        <section className="media-page">
            <div className="media-page-top">
                <button
                    className="media-back-button"
                    onClick={() => navigate(-1)}
                >
                    {"\u2190"} Back
                </button>
            </div>

            <header className="media-header">
                <div>
                    <span className="media-eyebrow">DISCOVER</span>
                    <h1>TV Series</h1>
                    <p>
                        Find popular series, returning favourites and new
                        stories to watch.
                    </p>
                </div>
            </header>

            <div className="media-section-title">
                <h2>Popular TV Series</h2>
                <span>{series.length} titles</span>
            </div>

            <div className="media-grid">
                {series.map((show) => (
                    <article
                        className="media-card"
                        key={show.id}
                        onClick={() => navigate(`/series/${show.id}`)}
                    >
                        <div className="media-poster">
                            {show.poster_path ? (
                                <img
                                    src={`${TMDB_IMAGE}${show.poster_path}`}
                                    alt={show.name || "TV Series"}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="media-no-poster">
                                    No Poster
                                </div>
                            )}

                            {show.vote_average != null && (
                                <div className="media-rating">
                                    <span>{"\u2605"}</span>
                                    {show.vote_average.toFixed(1)}
                                </div>
                            )}

                            <div className="media-card-overlay">
                                <span className="media-view">
                                    View Details {"\u2192"}
                                </span>
                            </div>
                        </div>

                        <div className="media-card-info">
                            <h3>{show.name || show.title}</h3>

                            <p>
                                {show.first_air_date
                                    ? show.first_air_date.slice(0, 4)
                                    : "Release date unavailable"}
                            </p>
                        </div>
                    </article>
                ))}
            </div>

            <div className="media-load-container">
                <button
                    className="media-load-more"
                    onClick={() => loadSeries(page + 1)}
                    disabled={loadingMore}
                >
                    {loadingMore ? (
                        <>
                            <span className="button-spinner"></span>
                            Loading...
                        </>
                    ) : (
                        <>
                            Load More <span>{"\u2193"}</span>
                        </>
                    )}
                </button>
            </div>
        </section>
    );
}

