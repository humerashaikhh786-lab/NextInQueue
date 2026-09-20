import "./GenreCards.css";

export default function GenreCards({ onSelect }) {
    return (
        <section className="genre-showcase">

            <div className="genre-showcase-header">
                <div>
                    <p className="genre-eyebrow">
                        DISCOVER YOUR NEXT FAVORITE
                    </p>

                    <h2>
                        Explore by <span>Genre</span>
                    </h2>

                    <p className="genre-subtitle">
                        Pick a mood. Find a story. Start watching.
                    </p>
                </div>
            </div>

            <div className="genre-showcase-grid">

                {GENRE_CARDS.map((genre) => (
                    <button
                        key={genre.id}
                        type="button"
                        className="genre-showcase-card"
                        onClick={() => onSelect(genre)}
                    >
                        <span className="genre-card-glow" />

                        <span className="genre-card-icon">
                            {genre.icon}
                        </span>

                        <span className="genre-card-content">

                            <span className="genre-card-name">
                                {genre.name}
                            </span>

                            <span className="genre-card-description">
                                {genre.description}
                            </span>

                        </span>

                        <span className="genre-card-arrow">
                            {"\u2192"}
                        </span>

                    </button>
                ))}

            </div>
        </section>
    );
}

const GENRE_CARDS = [
    {
        id: 28,
        name: "Action",
        icon: "\u2694\uFE0F",
        description: "High-energy adventures"
    },
    {
        id: 12,
        name: "Adventure",
        icon: "\uD83E\uDDED",
        description: "Epic journeys await"
    },
    {
        id: 16,
        name: "Animation",
        icon: "\uD83C\uDFA8",
        description: "Animated worlds"
    },
    {
        id: 35,
        name: "Comedy",
        icon: "\uD83D\uDE02",
        description: "Laugh out loud"
    },
    {
        id: 80,
        name: "Crime",
        icon: "\uD83D\uDD75\uFE0F",
        description: "Secrets & mysteries"
    },
    {
        id: 18,
        name: "Drama",
        icon: "\uD83C\uDFAD",
        description: "Stories that stay"
    },
    {
        id: 14,
        name: "Fantasy",
        icon: "\uD83E\uDDD9",
        description: "Magic & imagination"
    },
    {
        id: 27,
        name: "Horror",
        icon: "\uD83D\uDC7B",
        description: "Dare to watch"
    },
    {
        id: 9648,
        name: "Mystery",
        icon: "\uD83D\uDD0E",
        description: "Find the truth"
    },
    {
        id: 10749,
        name: "Romance",
        icon: "\u2764\uFE0F",
        description: "Love & relationships"
    },
    {
        id: 878,
        name: "Science Fiction",
        icon: "\uD83D\uDE80",
        description: "Beyond reality"
    },
    {
        id: 53,
        name: "Thriller",
        icon: "\u26A1",
        description: "Keep you guessing"
    }
];

