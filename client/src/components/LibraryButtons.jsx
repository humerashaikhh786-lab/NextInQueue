import { useState } from "react";

const API = "http://localhost:8080/api/library/toggle";

export default function LibraryButtons({ item }) {
    const [message, setMessage] = useState("");

    async function action(event, itemType) {
        event.preventDefault();
        event.stopPropagation();

        console.log("LIBRARY BUTTON CLICKED:", itemType, item);

        const token = localStorage.getItem("token");

        if (!token) {
            setMessage("Please log in first");
            setTimeout(() => setMessage(""), 2500);
            return;
        }

        setMessage("Saving...");

        try {
            const response = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    tmdbId: Number(item.id),
                    mediaType: item.media_type === "tv" ? "series" : "movie",
                    itemType: itemType,
                    title: item.title || item.name || "Untitled",
                    posterPath: item.poster_path || ""
                })
            });

            const data = await response.json();

            console.log("LIBRARY RESPONSE:", response.status, data);

            if (!response.ok) {
                throw new Error(data.error || "HTTP " + response.status);
            }

            const names = {
                queue: "Queue",
                favorite: "Favorites",
                watched: "Watched"
            };

            setMessage(
                data.active
                    ? "✓ Added to " + names[itemType]
                    : "Removed from " + names[itemType]
            );
        } catch (error) {
            console.error("LIBRARY ERROR:", error);
            setMessage("Error: " + error.message);
        }

        setTimeout(() => setMessage(""), 2500);
    }

    return (
        <>
            <div
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    zIndex: 99999,
                    display: "flex",
                    gap: "6px"
                }}
            >
                <button
                    type="button"
                    onClick={(e) => action(e, "queue")}
                    style={{
                        width: "36px",
                        height: "36px",
                        border: "0",
                        borderRadius: "50%",
                        cursor: "pointer",
                        background: "#111",
                        color: "#fff",
                        fontWeight: "700",
                        position: "relative",
                        zIndex: 100000
                    }}
                >
                    Q
                </button>

                <button
                    type="button"
                    onClick={(e) => action(e, "favorite")}
                    style={{
                        width: "36px",
                        height: "36px",
                        border: "0",
                        borderRadius: "50%",
                        cursor: "pointer",
                        background: "#111",
                        color: "#ff4f81",
                        fontSize: "18px",
                        position: "relative",
                        zIndex: 100000
                    }}
                >
                    ♥
                </button>

                <button
                    type="button"
                    onClick={(e) => action(e, "watched")}
                    style={{
                        width: "36px",
                        height: "36px",
                        border: "0",
                        borderRadius: "50%",
                        cursor: "pointer",
                        background: "#111",
                        color: "#62e6a5",
                        fontSize: "18px",
                        position: "relative",
                        zIndex: 100000
                    }}
                >
                    ✓
                </button>
            </div>

            {message && (
                <div
                    style={{
                        position: "fixed",
                        left: "50%",
                        bottom: "35px",
                        transform: "translateX(-50%)",
                        zIndex: 9999999,
                        background: "#111827",
                        color: "#fff",
                        padding: "14px 24px",
                        borderRadius: "10px",
                        fontWeight: "600",
                        boxShadow: "0 10px 35px rgba(0,0,0,.5)",
                        pointerEvents: "none"
                    }}
                >
                    {message}
                </div>
            )}
        </>
    );
}
