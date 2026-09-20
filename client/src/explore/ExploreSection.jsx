const LIBRARY_API = "http://localhost:8080/api/library/toggle";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ExploreSection.css";

const API_BASE = "http://localhost:8080/api/tmdb";

const GENRES = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 14, name: "Fantasy" },
    { id: 27, name: "Horror" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 53, name: "Thriller" }
];

function getTitle(item) {
    return item?.title || item?.name || "Untitled";
}

function getDate(item) {
    return item?.release_date || item?.first_air_date || "";
}

function getRoute(item) {
    return item?.media_type === "tv"
        ? `/series/${item.id}`
        : `/movie/${item.id}`;
}

function MovieCard({ item }) {

    const [toast, setToast] = useState("");

    async function libraryAction(event, itemType) {
        event.preventDefault();
        event.stopPropagation();
        const token = localStorage.getItem("token");
        if (!token) {
            setToast("Please log in first");
            setTimeout(() => setToast(""), 2500);
            return;
        }
        setToast("Saving...");
        try {
            const response = await fetch(LIBRARY_API, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
                body: JSON.stringify({ tmdbId: item.id, mediaType: item.media_type === "tv" ? "series" : "movie", itemType, title: item.title || item.name || "Untitled", posterPath: item.poster_path || "" })
            });
            const text = await response.text();
            console.log("LIBRARY:", response.status, text);
            if (!response.ok) throw new Error("HTTP " + response.status);
            const data = JSON.parse(text);
            const names = { queue: "Queue", favorite: "Favorites", watched: "Watched" };
            setToast(data.active ? "Added to " + names[itemType] : "Removed from " + names[itemType]);
        } catch (error) {
            console.error("LIBRARY ERROR:", error);
            setToast("Error: " + error.message);
        }
        setTimeout(() => setToast(""), 2500);
    }
    const poster = item?.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null;

    return (
        <Link
            to={getRoute(item)}
            className="explore-movie-card"
        >
            <div className="explore-poster">
                {poster ? (
                    <img
                        src={poster}
                        alt={getTitle(item)}
                        loading="lazy"
                    />
                ) : (
                    <div className="explore-no-poster">
                        NO POSTER
                    </div>
                )}

                {item?.vote_average > 0 && (
                    <span className="explore-rating">
                        &#9733; {Number(item.vote_average).toFixed(1)}
                    </span>
                )}

                <div className="explore-card-overlay">
                    <span>&#9654;</span>
                </div>
            </div>

            <div className="explore-card-info">
                <h3>{getTitle(item)}</h3>

                <div className="explore-card-meta">
                    <span>
                        {getDate(item)
                            ? getDate(item).substring(0, 4)
                            : "&mdash;"
                        }
                    </span>

                    <span>&bull;</span>

                    <span>
                        {item?.media_type === "tv"
                            ? "TV Series"
                            : "Movie"}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function ExploreSection() {
    const navigate = useNavigate();

    const [contentType, setContentType] = useState("all");

    const [regions, setRegions] = useState([]);
    const [regionSearch, setRegionSearch] = useState("");
    const [regionOpen, setRegionOpen] = useState(false);
    const [genre, setGenre] = useState("all");
    const [language, setLanguage] = useState("all");
    const [region, setRegion] = useState("all");
    const [year, setYear] = useState("all");
    const [sort, setSort] = useState("popularity");

    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadRegions() {
            try {
                const response = await fetch(
                    `${API_BASE}/regions`
                );

                if (!response.ok) {
                    throw new Error("Failed to load regions");
                }

                const data = await response.json();

                const list = Array.isArray(data)
                    ? data
                    : data.results || data.countries || [];

                setRegions(
                    list
                        .filter((item) => item && item.iso_3166_1 && item.english_name)
                        .sort((a, b) =>
                            a.english_name.localeCompare(b.english_name)
                        )
                );
            } catch (error) {
                console.error("Unable to load regions:", error);
            }
        }

        loadRegions();
    }, []);

    const filteredRegions = regions.filter((item) =>
        item.english_name
            .toLowerCase()
            .includes(regionSearch.toLowerCase())
    );

    async function fetchResults(
        pageNumber = 1,
        append = false
    ) {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            setError("");

            const params = new URLSearchParams();

            params.set("type", contentType);
            params.set("genre", genre);
            params.set("language", language);
            params.set("region", region);
            params.set("year", year);
            params.set("sort", sort);
            params.set("page", pageNumber);

            const response = await fetch(
                `${API_BASE}/explore?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error(
                    `Request failed: ${response.status}`
                );
            }

            const data = await response.json();

            const items = Array.isArray(data?.results)
                ? data.results
                : [];

            const normalized = items.map((item) => ({
                ...item,
                media_type:
                    item.media_type ||
                    (item.first_air_date
                        ? "tv"
                        : "movie")
            }));

            if (append) {
                setResults((previous) => {
                    const existing = new Set(
                        previous.map(
                            (item) =>
                                `${item.media_type}-${item.id}`
                        )
                    );

                    return [
                        ...previous,
                        ...normalized.filter(
                            (item) =>
                                !existing.has(
                                    `${item.media_type}-${item.id}`
                                )
                        )
                    ];
                });
            } else {
                setResults(normalized);
            }

            setPage(pageNumber);
        } catch (err) {
            console.error(
                "Explore error:",
                err
            );

            setError(
                "Unable to load explore results."
            );
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    function applyFilters() {
        setPage(1);
        fetchResults(1, false);
    }

    function loadMore() {
        if (loadingMore || loading) {
            return;
        }

        fetchResults(page + 1, true);
    }

    useEffect(() => {
        fetchResults(1, false);
    }, []);

    return (
        <main className="explore-page">

            <button
                type="button"
                className="back-button"
                onClick={() => navigate("/library")}
                >
                Back
            </button>

            <header className="page-header">

                <p className="section-label">
                    DISCOVER
                </p>

                <h1>Explore</h1>

                <p>
                    Find movies, TV series, and anime
                    using filters that match what you
                    want to watch.
                </p>

            </header>

            <section className="explore-filters">

                <div className="filter-group">
                    <label>Content Type</label>

                    <select
                        value={contentType}
                        onChange={(event) =>
                            setContentType(
                                event.target.value
                            )
                        }
                    >
                        <option value="all">
                            All
                        </option>

                        <option value="movie">
                            Movies
                        </option>

                        <option value="series">
                            TV Series
                        </option>

                        <option value="anime">
                            Anime
                        </option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Genre</label>

                    <select
                        value={genre}
                        onChange={(event) =>
                            setGenre(
                                event.target.value
                            )
                        }
                    >
                        <option value="all">
                            All Genres
                        </option>

                        {GENRES.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Language</label>

                    <select
                        value={language}
                        onChange={(event) =>
                            setLanguage(
                                event.target.value
                            )
                        }
                    >
                        <option value="all">
                            All Languages
                        </option>

                        <option value="en">
                            English
                        </option>

                        <option value="hi">
                            Hindi
                        </option>

                        <option value="ja">
                            Japanese
                        </option>

                        <option value="ko">
                            Korean
                        </option>

                        <option value="zh">
                            Chinese
                        </option>

                        <option value="fr">
                            French
                        </option>

                        <option value="es">
                            Spanish
                        </option>
                    </select>
                </div>

                <div className="filter-group region-filter-group">
                    <label>Region</label>

                    <div className="region-picker">
                        <button
                            type="button"
                            className="region-picker-button"
                            onClick={() => setRegionOpen((value) => !value)}
                        >
                            <span>
                                {region === "all"
                                    ? "All Regions"
                                    : regions.find(
                                        (item) => item.iso_3166_1 === region
                                    )?.english_name || region}
                            </span>

                            <span className="region-picker-arrow">
                                {regionOpen ? "\u25B2" : "\u25BC"}
                            </span>
                        </button>

                        {regionOpen && (
                            <div className="region-picker-menu">
                                <input
                                    type="text"
                                    value={regionSearch}
                                    onChange={(event) =>
                                        setRegionSearch(event.target.value)
                                    }
                                    placeholder="Search countries..."
                                    className="region-search-input"
                                    autoFocus
                                />

                                <button
                                    type="button"
                                    className={`region-option ${
                                        region === "all" ? "active" : ""
                                    }`}
                                    onClick={() => {
                                        setRegion("all");
                                        setRegionSearch("");
                                        setRegionOpen(false);
                                    }}
                                >
                                    All Regions
                                </button>

                                <div className="region-options-list">
                                    {filteredRegions.map((item) => (
                                        <button
                                            type="button"
                                            key={item.iso_3166_1}
                                            className={`region-option ${
                                                region === item.iso_3166_1
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() => {
                                                setRegion(item.iso_3166_1);
                                                setRegionSearch("");
                                                setRegionOpen(false);
                                            }}
                                        >
                                            {item.english_name}
                                        </button>
                                    ))}

                                    {filteredRegions.length === 0 && (
                                        <div className="region-no-results">
                                            No regions found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="filter-group">
                    <label>Year</label>

                    <select
                        value={year}
                        onChange={(event) =>
                            setYear(
                                event.target.value
                            )
                        }
                    >
                        <option value="all">
                            Any Year
                        </option>

                        {[
                            2026,
                            2025,
                            2024,
                            2023,
                            2022,
                            2021,
                            2020,
                            2019,
                            2018,
                            2017,
                            2016
                        ].map((item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Sort By</label>

                    <select
                        value={sort}
                        onChange={(event) =>
                            setSort(
                                event.target.value
                            )
                        }
                    >
                        <option value="popularity">
                            Popularity
                        </option>

                        <option value="rating">
                            Rating
                        </option>

                        <option value="release">
                            Release Date
                        </option>
                    </select>
                </div>

                <button
                    type="button"
                    className="primary-button"
                    onClick={applyFilters}
                    disabled={loading}
                >
                    {loading
                        ? "Loading..."
                        : "Apply Filters"}
                </button>

            </section>

            <section className="explore-results">

                <div className="section-heading">

                    <div>
                        <p className="section-label">
                            RESULTS
                        </p>

                        <h2>
                            Discover Something New
                        </h2>
                    </div>

                    {results.length > 0 && (
                        <span className="explore-count">
                            {results.length} titles
                        </span>
                    )}

                </div>

                {loading && results.length === 0 ? (
                    <div className="explore-loading">
                        <div className="explore-spinner" />

                        <p>
                            Finding titles for you...
                        </p>
                    </div>
                ) : error ? (
                    <div className="empty-state">
                        {error}
                    </div>
                ) : results.length === 0 ? (
                    <div className="empty-state">
                        No titles found with these
                        filters.
                    </div>
                ) : (
                    <>
                        <div className="movie-grid explore-movie-grid">

                            {results.map(
                                (item, index) => (
                                    <MovieCard
                                        key={`${item.media_type}-${item.id}-${index}`}
                                        item={item}
                                    />
                                )
                            )}

                        </div>

                        <div className="explore-load-more">

                            <button
                                type="button"
                                className="load-more-button"
                                onClick={loadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore
                                    ? "Loading..."
                                    : "Load More \u2192"}
                            </button>
                        </div>
                    </>
                )}

            </section>

        </main>
    );
}

