import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import "./MovieDetails.css";

const API_BASE = import.meta.env.VITE_API_URL;
const TMDB_IMAGE = "https://image.tmdb.org/t/p/";

function MovieDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const mediaType = location.pathname.startsWith("/anime/")
        ? "anime"
        : location.pathname.startsWith("/series/")
            ? "series"
            : "movie";

    const [details, setDetails] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [visibleRecommendations, setVisibleRecommendations] = useState(8);
    const [loading, setLoading] = useState(true);
    const [recommendationsLoading, setRecommendationsLoading] = useState(true);
    const [error, setError] = useState("");
    const [libraryLoading, setLibraryLoading] = useState("");
    const [libraryMessage, setLibraryMessage] = useState("");

    useEffect(() => {
        const tmdbType = mediaType === "movie" ? "movie" : "tv";

        const detailsEndpoint =
            `${API_BASE}/api/tmdb/${tmdbType}/${id}`;

        const recommendationsEndpoint =
            `${API_BASE}/api/tmdb/${tmdbType}/${id}/recommendations`;

        setLoading(true);
        setRecommendationsLoading(true);
        setError("");
        setVisibleRecommendations(8);

        Promise.all([
            fetch(detailsEndpoint),
            fetch(recommendationsEndpoint)
        ])
            .then(async ([detailsResponse, recommendationsResponse]) => {
                if (!detailsResponse.ok) {
                    throw new Error("Failed to load title details");
                }

                const detailsData = await detailsResponse.json();

                let recommendationsData = { results: [] };

                if (recommendationsResponse.ok) {
                    recommendationsData = await recommendationsResponse.json();
                }

                return {
                    detailsData,
                    recommendationsData
                };
            })
            .then(({ detailsData, recommendationsData }) => {
                setDetails(detailsData);
                setRecommendations(
                    (recommendationsData.results || [])
                );
                setLoading(false);
                setRecommendationsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Unable to load this title.");
                setLoading(false);
                setRecommendationsLoading(false);
            });
    }, [id, mediaType]);

    useEffect(() => {
        if (!details) return;

        const saveHistory = async () => {
            const token = localStorage.getItem("token");

            if (!token) return;

            try {
                await fetch(`${API_BASE}/api/history/add`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        tmdbId: Number(id),
                        mediaType,
                        title: details.title || details.name || "Untitled",
                        posterPath: details.poster_path || ""
                    })
                });

                window.dispatchEvent(
                    new Event("nextinqueue-history-updated")
                );
            } catch (error) {
                console.error("History save error:", error);
            }
        };

        saveHistory();
    }, [details, id, mediaType]);

    const handleLibraryToggle = async (itemType) => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        if (!details) return;

        setLibraryLoading(itemType);
        setLibraryMessage("");

        try {
            const response = await fetch(
                `${API_BASE}/api/library/toggle`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        tmdbId: Number(id),
                        mediaType,
                        itemType,
                        title: details.title || details.name || "Untitled",
                        posterPath: details.poster_path || ""
                    })
                }
            );

            if (response.status === 401 || response.status === 403) {
                navigate("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || "Could not update your library."
                );
            }

            const names = {
                queue: "Queue",
                favorite: "Favorites",
                watched: "Watched"
            };

            setLibraryMessage(
                data.active
                    ? `Added to ${names[itemType]}!`
                    : `Removed from ${names[itemType]}!`
            );

            window.dispatchEvent(
                new Event("nextinqueue-library-updated")
            );
        } catch (error) {
            console.error("Library toggle error:", error);
            setLibraryMessage(
                error.message || "Something went wrong."
            );
        } finally {
            setLibraryLoading("");
        }
    };

    if (loading) {
        return (
            <div className="details-page details-loading-page">
                <div className="details-loading">
                    <div className="details-spinner"></div>
                    <p>Loading details...</p>
                </div>
            </div>
        );
    }

    if (error || !details) {
        return (
            <div className="details-page details-error-page">
                <button
                    className="details-back-button"
                    onClick={() => navigate(-1)}
                >
                    {"\u2190"} Back
                </button>

                <div className="details-error-card">
                    <div className="details-error-icon">!</div>
                    <h2>{error || "Title not found."}</h2>

                    <button
                        className="details-primary-button"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const title = details.title || details.name || "Untitled";

    const releaseDate =
        details.release_date ||
        details.first_air_date ||
        "N/A";

    const runtime = details.runtime
        ? `${details.runtime} min`
        : details.episode_run_time?.length
            ? `${details.episode_run_time[0]} min/episode`
            : "N/A";

    const language =
        details.original_language?.toUpperCase() || "N/A";

    const genres = details.genres || [];

    const cast =
        details.credits?.cast
            ?.filter(
                (person) => person && person.id && person.name
            )
            .slice(0, 8) || [];

    const rating =
        typeof details.vote_average === "number"
            ? details.vote_average.toFixed(1)
            : "N/A";

    const backdrop = details.backdrop_path
        ? `${TMDB_IMAGE}original${details.backdrop_path}`
        : "";

    const poster = details.poster_path
        ? `${TMDB_IMAGE}w500${details.poster_path}`
        : "";

    const typeLabel =
        mediaType === "anime"
            ? "ANIME"
            : mediaType === "series"
                ? "TV SERIES"
                : "MOVIE";

    return (
        <div className="details-page">

            <section className="details-hero">

                {backdrop && (
                    <div className="details-hero-background">
                        <img src={backdrop} alt="" />
                    </div>
                )}

                <div className="details-hero-gradient"></div>

                <div className="details-hero-inner">

                    <button
                        className="details-back-button details-hero-back"
                        onClick={() => navigate(-1)}
                    >
                        {"\u2190"} Back
                    </button>

                    <div className="details-main">

                        <div className="details-poster-wrap">
                            {poster ? (
                                <img
                                    className="details-poster-image"
                                    src={poster}
                                    alt={title}
                                />
                            ) : (
                                <div className="details-poster-placeholder">
                                    <span>[ ]</span>
                                    <p>No Poster</p>
                                </div>
                            )}
                        </div>

                        <div className="details-main-info">

                            <div className="details-type-badge">
                                {typeLabel}
                            </div>

                            <h1 className="details-title">
                                {title}
                            </h1>

                            <div className="details-meta-row">

                                <span className="details-rating">
                                    <span className="star-icon">*</span>
                                    {rating}
                                </span>

                                <span className="meta-divider"></span>

                                <span>{releaseDate}</span>

                                <span className="meta-divider"></span>

                                <span>{language}</span>

                                <span className="meta-divider"></span>

                                <span>{runtime}</span>

                            </div>

                            <div className="details-genre-row">
                                {genres.length > 0 ? (
                                    genres.slice(0, 5).map((genre) => (
                                        <span
                                            className="details-genre-pill"
                                            key={genre.id || genre.name}
                                        >
                                            {genre.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="details-genre-pill">
                                        General
                                    </span>
                                )}
                            </div>

                            <p className="details-overview">
                                {details.overview ||
                                    "No description available for this title."}
                            </p>

                            <div className="details-actions">

                                <Link
                                    to={`/watch/${mediaType === "movie" ? "movie" : "series"}/${id}`}
                                    className="details-primary-button"
                                >
                                    <span>&gt;</span>
                                    Watch Now
                                </Link>

                                <button
                                    className="details-secondary-button"
                                    onClick={() =>
                                        handleLibraryToggle("queue")
                                    }
                                    disabled={libraryLoading === "queue"}
                                >
                                    <span>+</span>
                                    {libraryLoading === "queue"
                                        ? "Saving..."
                                        : "Add to Queue"}
                                </button>

                                <button
                                    className="details-secondary-button"
                                    onClick={() =>
                                        handleLibraryToggle("favorite")
                                    }
                                    disabled={libraryLoading === "favorite"}
                                >
                                    <span>&lt;3</span>
                                    {libraryLoading === "favorite"
                                        ? "Saving..."
                                        : "Favorite"}
                                </button>

                                <button
                                    className="details-secondary-button"
                                    onClick={() =>
                                        handleLibraryToggle("watched")
                                    }
                                    disabled={libraryLoading === "watched"}
                                >
                                    <span>O</span>
                                    {libraryLoading === "watched"
                                        ? "Saving..."
                                        : "Watched"}
                                </button>

                            </div>

                            {libraryMessage && (
                                <div
                                    style={{
                                        marginTop: "12px",
                                        color: "#ff4665",
                                        fontSize: "13px",
                                        fontWeight: "700"
                                    }}
                                >
                                    {libraryMessage}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </section>

            <main className="details-body">

                <section className="details-info-grid">

                    <div className="details-panel details-panel-small">

                        <div className="details-panel-heading">
                            <span className="panel-icon">[ ]</span>
                            <h2>Details</h2>
                        </div>

                        <div className="details-fact-list">

                            <div className="details-fact">
                                <span className="fact-icon">[D]</span>
                                <div>
                                    <small>Release Date</small>
                                    <strong>{releaseDate}</strong>
                                </div>
                            </div>

                            <div className="details-fact">
                                <span className="fact-icon">[L]</span>
                                <div>
                                    <small>Language</small>
                                    <strong>{language}</strong>
                                </div>
                            </div>

                            <div className="details-fact">
                                <span className="fact-icon">[T]</span>
                                <div>
                                    <small>Runtime</small>
                                    <strong>{runtime}</strong>
                                </div>
                            </div>

                            <div className="details-fact">
                                <span className="fact-icon">[G]</span>
                                <div>
                                    <small>Genre</small>
                                    <strong>
                                        {genres[0]?.name || "N/A"}
                                    </strong>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="details-panel details-panel-overview">

                        <div className="details-panel-heading">
                            <span className="panel-icon">[=]</span>
                            <h2>Overview</h2>
                        </div>

                        <p className="overview-text">
                            {details.overview ||
                                "No overview is available for this title."}
                        </p>

                    </div>

                    <div className="details-panel details-panel-cast">

                        <div className="details-panel-heading">

                            <div>
                                <p className="panel-eyebrow">
                                    CAST
                                </p>

                                <h2>Top Cast</h2>
                            </div>

                            {cast.length > 0 && (
                                <span className="cast-count">
                                    {cast.length}
                                </span>
                            )}

                        </div>

                        {cast.length > 0 ? (
                            <div className="details-cast-list">

                                {cast.slice(0, 6).map((person) => (
                                    <Link
                                        key={person.id}
                                        to={`/actor/${person.id}`}
                                        className="details-cast-item"
                                    >

                                        {person.profile_path ? (
                                            <img
                                                src={`${TMDB_IMAGE}w185${person.profile_path}`}
                                                alt={person.name}
                                            />
                                        ) : (
                                            <div className="cast-avatar-placeholder">
                                                No Image
                                            </div>
                                        )}

                                        <div>
                                            <strong>{person.name}</strong>
                                            <span>
                                                {person.character ||
                                                    "Supporting Role"}
                                            </span>
                                        </div>

                                    </Link>
                                ))}

                            </div>
                        ) : (
                            <p className="details-empty-text">
                                Cast information is not available.
                            </p>
                        )}

                    </div>

                </section>

                <section className="details-cast-full-section">

                    <div className="details-section-heading">
                        <div>
                            <p className="section-eyebrow">
                                THE PEOPLE BEHIND THE STORY
                            </p>

                            <h2>Cast & Characters</h2>
                        </div>
                    </div>

                    {cast.length > 0 ? (
                        <div className="details-cast-full-grid">

                            {cast.map((person) => (
                                <Link
                                    key={person.id}
                                    to={`/actor/${person.id}`}
                                    className="details-cast-full-card"
                                >

                                    <div className="details-cast-full-image">
                                        {person.profile_path ? (
                                            <img
                                                src={`${TMDB_IMAGE}w300${person.profile_path}`}
                                                alt={person.name}
                                            />
                                        ) : (
                                            <span>No Image</span>
                                        )}
                                    </div>

                                    <div className="details-cast-full-info">

                                        <h3>{person.name}</h3>

                                        <p>
                                            {person.character ||
                                                "Unknown role"}
                                        </p>

                                        <span className="cast-view-profile">
                                            View Profile &gt;
                                        </span>

                                    </div>

                                </Link>
                            ))}

                        </div>
                    ) : (
                        <p className="details-empty-text">
                            No cast information available.
                        </p>
                    )}

                </section>

                <section className="details-recommendations">

                    <div className="details-section-heading recommendation-heading">

                        <div>
                            <p className="section-eyebrow">
                                DISCOVER SOMETHING SIMILAR
                            </p>

                            <h2>You Might Also Like</h2>
                        </div>

                        {recommendations.length > 0 && (
                            <span className="recommendation-count">
                                {recommendations.length} titles
                            </span>
                        )}

                    </div>

                    {recommendationsLoading ? (
                        <div className="details-recommendation-loading">
                            <div className="details-spinner"></div>
                            <span>Loading recommendations...</span>
                        </div>
                    ) : recommendations.length > 0 ? (
                        <>
                            <div className="details-recommendation-grid">

                                {recommendations
                                    .slice(0, visibleRecommendations)
                                    .map((item) => {

                                        const itemTitle =
                                            item.title ||
                                            item.name ||
                                            "Untitled";

                                        const route =
                                            item.media_type === "tv"
                                                ? `/series/${item.id}`
                                                : mediaType === "movie"
                                                    ? `/movie/${item.id}`
                                                    : `/series/${item.id}`;

                                        const itemDate =
                                            item.release_date ||
                                            item.first_air_date ||
                                            "";

                                        const itemRating =
                                            typeof item.vote_average === "number"
                                                ? item.vote_average.toFixed(1)
                                                : "N/A";

                                        return (
                                            <Link
                                                key={item.id}
                                                to={route}
                                                className="details-recommendation-card"
                                            >

                                                <div className="recommendation-poster">

                                                    {item.poster_path ? (
                                                        <img
                                                            src={`${TMDB_IMAGE}w500${item.poster_path}`}
                                                            alt={itemTitle}
                                                        />
                                                    ) : (
                                                        <div className="recommendation-placeholder">
                                                            No Image
                                                        </div>
                                                    )}

                                                    <div className="recommendation-hover">
                                                        View Details
                                                    </div>

                                                </div>

                                                <div className="recommendation-info">

                                                    <h3>{itemTitle}</h3>

                                                    <div className="recommendation-meta">

                                                        <span>
                                                            * {itemRating}
                                                        </span>

                                                        {itemDate && (
                                                            <span>
                                                                {itemDate.substring(0, 4)}
                                                            </span>
                                                        )}

                                                    </div>

                                                </div>

                                            </Link>
                                        );
                                    })}

                            </div>

                            {visibleRecommendations < recommendations.length && (
                                <div className="details-load-more-wrap">

                                    <button
                                        type="button"
                                        className="details-load-more"
                                        onClick={() =>
                                            setVisibleRecommendations(
                                                (current) =>
                                                    Math.min(
                                                        current + 4,
                                                        recommendations.length
                                                    )
                                            )
                                        }
                                    >
                                        Load More
                                        <span>-&gt;</span>
                                    </button>

                                </div>
                            )}

                        </>
                    ) : (
                        <p className="details-empty-text">
                            No similar titles found.
                        </p>
                    )}

                </section>

            </main>
        </div>
    );
}

export default MovieDetails;



