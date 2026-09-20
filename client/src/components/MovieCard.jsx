import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "${VITE_API_URL}/api";

function getMediaType(type) {
    if (type === "series" || type === "tv") return "series";
    if (type === "anime") return "anime";
    return "movie";
}

export default function MovieCard({ movie, type = "movie" }) {

    const [toast, setToast] = useState("");

    if (!movie) {
        return null;
    }

    const id = movie.id;
    const title = movie.title || movie.name || "Untitled";
    const mediaType = getMediaType(type);

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;

    const detailsPath = `/${mediaType}/${id}`;

    function showToast(message) {
        console.log("MOVIE CARD BUTTON:", message);

        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 2500);
    }

    async function handleLibraryAction(event, itemType) {

        event.preventDefault();
        event.stopPropagation();

        console.log(
            "BUTTON CLICKED:",
            itemType,
            title,
            id
        );

        const token = localStorage.getItem("token");

        if (!token) {
            showToast("Please log in first");
            return;
        }

        const names = {
            queue: "Queue",
            favorite: "Favorites",
            watched: "Watched"
        };

        showToast(`Saving to ${names[itemType]}...`);

        try {

            const response = await fetch(
                `${API_BASE}/library/toggle`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        tmdbId: id,
                        mediaType: mediaType,
                        itemType: itemType,
                        title: title,
                        posterPath: movie.poster_path || ""
                    })
                }
            );

            const text = await response.text();

            console.log(
                "BACKEND STATUS:",
                response.status
            );

            console.log(
                "BACKEND RESPONSE:",
                text
            );

            if (!response.ok) {
                throw new Error(
                    `Backend returned ${response.status}`
                );
            }

            const data = JSON.parse(text);

            if (data.active) {
                showToast(`Added to ${names[itemType]}`);
            } else {
                showToast(`Removed from ${names[itemType]}`);
            }

        } catch (error) {

            console.error(
                "LIBRARY ERROR:",
                error
            );

            showToast(
                `Backend error: ${error.message}`
            );
        }
    }

    return (
        <article className="movie-card">

            <div className="movie-card-poster">

                <Link
                    to={detailsPath}
                    className="movie-card-link"
                >
                    {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={`${title} poster`}
                            loading="lazy"
                        />
                    ) : (
                        <div className="movie-card-no-poster">
                            <span>??</span>
                            <p>No Poster</p>
                        </div>
                    )}
                </Link>

                <div
                    className="movie-card-library-actions"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                >

                    <button
                        type="button"
                        className="movie-library-button queue"
                        onClick={(event) =>
                            handleLibraryAction(
                                event,
                                "queue"
                            )
                        }
                    >
                        Q
                    </button>

                    <button
                        type="button"
                        className="movie-library-button favorite"
                        onClick={(event) =>
                            handleLibraryAction(
                                event,
                                "favorite"
                            )
                        }
                    >
                        ?
                    </button>

                    <button
                        type="button"
                        className="movie-library-button watched"
                        onClick={(event) =>
                            handleLibraryAction(
                                event,
                                "watched"
                            )
                        }
                    >
                        ?
                    </button>

                </div>

                {toast && (
                    <div className="movie-card-toast">
                        {toast}
                    </div>
                )}

            </div>

            <Link
                to={detailsPath}
                className="movie-card-info"
            >
                <h3>{title}</h3>

                <div className="movie-card-meta">
                    <span>
                        {mediaType === "series"
                            ? "TV Series"
                            : mediaType === "anime"
                                ? "Anime"
                                : "Movie"}
                    </span>
                </div>
            </Link>

        </article>
    );
}

