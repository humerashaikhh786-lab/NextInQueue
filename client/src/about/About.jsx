import { useNavigate } from "react-router-dom";

function About() {
    const navigate = useNavigate();

    return (
        <main className="about-page">
            <button
                type="button"
                className="back-button"
                onClick={() => navigate(-1)}
            >
                â† Back
            </button>

            <header className="page-header">
                <p className="section-label">ABOUT</p>

                <h1>NextInQueue</h1>

                <p>
                    Your personal entertainment universe for discovering and
                    managing movies, TV series, and anime.
                </p>
            </header>

            <section className="about-section">
                <h2>Our Purpose</h2>

                <p>
                    NextInQueue brings entertainment discovery and personal
                    watch management together in one place.
                </p>
            </section>

            <section className="about-section">
                <h2>Features</h2>

                <ul>
                    <li>Movie, TV series, and anime discovery</li>
                    <li>Search and advanced filtering</li>
                    <li>Personal queue and favorites</li>
                    <li>Watched list and viewing history</li>
                    <li>Personal ratings</li>
                    <li>Actor profiles and filmographies</li>
                    <li>Legitimate watch-provider information</li>
                    <li>Personal account and persistent preferences</li>
                </ul>
            </section>

            <section className="about-section">
                <h2>Technology</h2>

                <p>
                    The application uses React and Vite on the frontend,
                    Spring Boot on the backend, MySQL for persistent application
                    data, and TMDB for entertainment information.
                </p>
            </section>

            <section className="about-section">
                <h2>TMDB Integration</h2>

                <p>
                    Entertainment information such as posters, descriptions,
                    ratings, release information, genres, cast, and discovery
                    data will be retrieved through TMDB services.
                </p>
            </section>

            <section className="about-section">
                <h2>Version</h2>

                <p>NextInQueue â€” Initial Development Version</p>
            </section>
        </main>
    );
}

export default About;
