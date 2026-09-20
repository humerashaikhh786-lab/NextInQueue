import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ActorProfile.css";

const API_BASE = "${VITE_API_URL}/api/tmdb";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/";

export default function ActorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [actor, setActor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadActor() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_BASE}/person/${id}`
                );

                if (!response.ok) {
                    throw new Error("Failed to load actor information.");
                }

                const data = await response.json();

                if (!cancelled) {
                    setActor(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadActor();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const movieCredits = useMemo(() => {
        if (!actor?.movie_credits?.cast) return [];

        return actor.movie_credits.cast
            .filter((item) => item && item.id)
            .sort((a, b) => {
                const dateA = a.release_date || "";
                const dateB = b.release_date || "";
                return dateB.localeCompare(dateA);
            });
    }, [actor]);

    const tvCredits = useMemo(() => {
        if (!actor?.tv_credits?.cast) return [];

        return actor.tv_credits.cast
            .filter((item) => item && item.id)
            .sort((a, b) => {
                const dateA = a.first_air_date || "";
                const dateB = b.first_air_date || "";
                return dateB.localeCompare(dateA);
            });
    }, [actor]);

    const knownFor = useMemo(() => {
        const combined = [
            ...movieCredits.map((item) => ({
                ...item,
                media_type: "movie"
            })),
            ...tvCredits.map((item) => ({
                ...item,
                media_type: "tv"
            }))
        ];

        const unique = new Map();

        combined.forEach((item) => {
            const key = `${item.media_type}-${item.id}`;

            if (!unique.has(key)) {
                unique.set(key, item);
            }
        });

        return Array.from(unique.values())
            .sort(
                (a, b) =>
                    (b.vote_average || 0) - (a.vote_average || 0)
            )
            .slice(0, 12);
    }, [movieCredits, tvCredits]);

    function openCredit(item) {
        if (item.media_type === "tv") {
            navigate(`/series/${item.id}`);
        } else {
            navigate(`/movie/${item.id}`);
        }
    }

    function getTitle(item) {
        return item.title || item.name || "Untitled";
    }

    function getYear(item) {
        const date = item.release_date || item.first_air_date;
        return date ? date.substring(0, 4) : "—";
    }

    function getCharacter(item) {
        if (!item.character) return "";

        return item.character
            .split("/")
            .map((value) => value.trim())
            .filter(Boolean)
            .slice(0, 2)
            .join(" / ");
    }

    if (loading) {
        return (
            <div className="actor-page-state">
                <div className="actor-spinner"></div>
                <p>Loading actor profile...</p>
            </div>
        );
    }

    if (error || !actor) {
        return (
            <div className="actor-page-state">
                <p>{error || "Actor not found."}</p>

                <button
                    onClick={() => navigate(-1)}
                    className="actor-back-button"
                >
                    {"\u2190"} Back
                </button>
            </div>
        );
    }

    return (
        <main className="actor-page">
            <button
                className="actor-back-button"
                onClick={() => navigate(-1)}
            >
                {"\u2190"} Back
            </button>

            {/* HERO */}
            <section className="actor-hero">
                <div className="actor-hero-glow"></div>

                <div className="actor-photo-wrapper">
                    {actor.profile_path ? (
                        <img
                            src={`${TMDB_IMAGE}w500${actor.profile_path}`}
                            alt={actor.name}
                            className="actor-photo"
                        />
                    ) : (
                        <div className="actor-photo-placeholder">
                            No Photo
                        </div>
                    )}
                </div>

                <div className="actor-info">
                    <span className="actor-eyebrow">
                        ACTOR PROFILE
                    </span>

                    <h1>{actor.name}</h1>

                    {actor.known_for_department && (
                        <p className="actor-department">
                            {actor.known_for_department}
                        </p>
                    )}

                    <div className="actor-meta">
                        {actor.birthday && (
                            <span>
                                Born {actor.birthday}
                            </span>
                        )}

                        {actor.place_of_birth && (
                            <span>
                                {actor.place_of_birth}
                            </span>
                        )}
                    </div>

                    {actor.biography && (
                        <div className="actor-biography">
                            <h2>Biography</h2>
                            <p>{actor.biography}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* KNOWN FOR */}
            <section className="actor-section">
                <div className="actor-section-heading">
                    <div>
                        <span className="actor-section-eyebrow">
                            SELECTED WORKS
                        </span>
                        <h2>Known For</h2>
                    </div>

                    <span className="actor-count">
                        {knownFor.length} titles
                    </span>
                </div>

                {knownFor.length === 0 ? (
                    <div className="actor-empty">
                        No known works found.
                    </div>
                ) : (
                    <div className="actor-known-grid">
                        {knownFor.map((item) => (
                            <article
                                key={`${item.media_type}-${item.id}`}
                                className="actor-work-card"
                                onClick={() => openCredit(item)}
                            >
                                <div className="actor-work-poster">
                                    {item.poster_path ? (
                                        <img
                                            src={`${TMDB_IMAGE}w500${item.poster_path}`}
                                            alt={getTitle(item)}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="actor-no-poster">
                                            No Poster
                                        </div>
                                    )}

                                    <span className="actor-media-badge">
                                        {item.media_type === "tv"
                                            ? "TV"
                                            : "MOVIE"}
                                    </span>

                                    {item.vote_average != null && (
                                        <span className="actor-rating">
                                            {"\u2605"}{" "}
                                            {item.vote_average.toFixed(1)}
                                        </span>
                                    )}
                                </div>

                                <div className="actor-work-info">
                                    <h3>{getTitle(item)}</h3>
                                    <p>{getYear(item)}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* MOVIES */}
            <section className="actor-section">
                <div className="actor-section-heading">
                    <div>
                        <span className="actor-section-eyebrow">
                            FILMOGRAPHY
                        </span>
                        <h2>Movies</h2>
                    </div>

                    <span className="actor-count">
                        {movieCredits.length} movies
                    </span>
                </div>

                {movieCredits.length === 0 ? (
                    <div className="actor-empty">
                        No movie credits found.
                    </div>
                ) : (
                    <div className="actor-filmography-grid">
                        {movieCredits.map((movie) => (
                            <article
                                key={`movie-${movie.id}-${movie.credit_id || ""}`}
                                className="actor-film-card"
                                onClick={() =>
                                    openCredit({
                                        ...movie,
                                        media_type: "movie"
                                    })
                                }
                            >
                                <div className="actor-film-poster">
                                    {movie.poster_path ? (
                                        <img
                                            src={`${TMDB_IMAGE}w342${movie.poster_path}`}
                                            alt={getTitle(movie)}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="actor-no-poster">
                                            No Poster
                                        </div>
                                    )}
                                </div>

                                <div className="actor-film-info">
                                    <h3>{getTitle(movie)}</h3>

                                    <div className="actor-film-meta">
                                        <span>{getYear(movie)}</span>

                                        {movie.vote_average != null && (
                                            <span>
                                                {"\u2605"}{" "}
                                                {movie.vote_average.toFixed(
                                                    1
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {getCharacter(movie) && (
                                        <p>
                                            As{" "}
                                            <strong>
                                                {getCharacter(movie)}
                                            </strong>
                                        </p>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* TV */}
            <section className="actor-section">
                <div className="actor-section-heading">
                    <div>
                        <span className="actor-section-eyebrow">
                            TELEVISION
                        </span>
                        <h2>TV Series</h2>
                    </div>

                    <span className="actor-count">
                        {tvCredits.length} series
                    </span>
                </div>

                {tvCredits.length === 0 ? (
                    <div className="actor-empty">
                        No TV series credits found.
                    </div>
                ) : (
                    <div className="actor-filmography-grid">
                        {tvCredits.map((show) => (
                            <article
                                key={`tv-${show.id}-${show.credit_id || ""}`}
                                className="actor-film-card"
                                onClick={() =>
                                    openCredit({
                                        ...show,
                                        media_type: "tv"
                                    })
                                }
                            >
                                <div className="actor-film-poster">
                                    {show.poster_path ? (
                                        <img
                                            src={`${TMDB_IMAGE}w342${show.poster_path}`}
                                            alt={getTitle(show)}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="actor-no-poster">
                                            No Poster
                                        </div>
                                    )}
                                </div>

                                <div className="actor-film-info">
                                    <h3>{getTitle(show)}</h3>

                                    <div className="actor-film-meta">
                                        <span>{getYear(show)}</span>

                                        {show.vote_average != null && (
                                            <span>
                                                {"\u2605"}{" "}
                                                {show.vote_average.toFixed(
                                                    1
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {getCharacter(show) && (
                                        <p>
                                            As{" "}
                                            <strong>
                                                {getCharacter(show)}
                                            </strong>
                                        </p>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

