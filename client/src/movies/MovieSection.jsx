import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MediaSection.css";

const API_BASE = import.meta.env.VITE_API_URL + "/api/tmdb";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";

export default function MovieSection() {
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function loadMovies(nextPage = 1) {
        try {
            setError("");

            if (nextPage === 1) setLoading(true);
            else setLoadingMore(true);

            const response = await fetch(
                `${API_BASE}/popular/movies?page=${nextPage}`
            );

            if (!response.ok) {
                throw new Error("Failed to load movies");
            }

            const data = await response.json();

            setMovies((previous) =>
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
        loadMovies(1);
    }, []);

    if (loading) {
        return (
            <div className="media-page-state">
                <div className="media-spinner"></div>
                <p>Loading movies...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="media-page-state">
                <p>{error}</p>
                <button onClick={() => loadMovies(1)}>Try Again</button>
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
                    <h1>Movies</h1>
                    <p>
                        Explore movies that are currently popular around the
                        world.
                    </p>
                </div>
            </header>

            <div className="media-section-title">
                <h2>Popular Movies</h2>
                <span>{movies.length} titles</span>
            </div>

            <div className="media-grid">
                {movies.map((movie) => (
                    <article
                        className="media-card"
                        key={movie.id}
                        onClick={() => navigate(`/movie/${movie.id}`)}
                    >
                        <div className="media-poster">
                            {movie.poster_path ? (
                                <img
                                    src={`${TMDB_IMAGE}${movie.poster_path}`}
                                    alt={movie.title || "Movie"}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="media-no-poster">
                                    No Poster
                                </div>
                            )}

                            {movie.vote_average != null && (
                                <div className="media-rating">
                                    <span>{"\u2605"}</span>
                                    {movie.vote_average.toFixed(1)}
                                </div>
                            )}

                            <div className="media-card-overlay">
                                <span className="media-view">
                                    View Details {"\u2192"}
                                </span>
                            </div>
                        </div>

                        <div className="media-card-info">
                            <h3>{movie.title || movie.name}</h3>

                            <p>
                                {movie.release_date
                                    ? movie.release_date.slice(0, 4)
                                    : "Release date unavailable"}
                            </p>
                        </div>
                    </article>
                ))}
            </div>

            <div className="media-load-container">
                <button
                    className="media-load-more"
                    onClick={() => loadMovies(page + 1)}
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

