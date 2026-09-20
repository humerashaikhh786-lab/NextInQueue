import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./WatchNow.css";

function WatchNow() {

    const { type, id } = useParams();
    const navigate = useNavigate();

    const [regions, setRegions] = useState([]);

    useEffect(() => {
        async function loadRegions() {
            try {
                const response = await fetch(
                    "http://localhost:8080/api/tmdb/regions"
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
                        .filter(
                            (item) =>
                                item &&
                                item.iso_3166_1 &&
                                item.english_name
                        )
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



    const [region, setRegion] = useState("");
    const [title, setTitle] = useState("");
    const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);    
    useEffect(() => {
        async function loadTitle() {
            try {
                const endpoint = type === "series"
                    ? `http://localhost:8080/api/tmdb/tv/${id}`
                    : `http://localhost:8080/api/tmdb/movie/${id}`;

                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error("Failed to load title");
                }

                const data = await response.json();
                setTitle(data.title || data.name || "");
            } catch (error) {
                console.error("Unable to load title:", error);
            }
        }

        loadTitle();
    }, [type, id]);

    const [regionSearch, setRegionSearch] = useState("");
    const [providers, setProviders] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegionSelect = async (selectedRegion) => {

        setRegion(selectedRegion);
        setProviders(null);
        setError("");
        setLoading(true);

        try {

            const endpoint =
                type === "series"
                    ? `http://localhost:8080/api/tmdb/tv/${id}/watch-providers?region=${selectedRegion}`
                    : `http://localhost:8080/api/tmdb/movie/${id}/watch-providers?region=${selectedRegion}`;

            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error("Unable to load watch providers.");
            }

            const data = await response.json();

            setProviders(data);

        } catch (err) {

            console.error(err);
            setError("Unable to load providers for this region.");

        } finally {

            setLoading(false);
        }
    };

    const providerGroups = providers?.results?.[region];

    const includedProviders =
        providerGroups?.flatrate || [];

    const freeProviders =
        [...(providerGroups?.free || []), ...(providerGroups?.ads || [])];

    const rentProviders =
        providerGroups?.rent || [];

    const buyProviders =
        providerGroups?.buy || [];

    const selectedRegion =
        regions.find((item) => item.iso_3166_1 === region);

    const hasProviders =
        includedProviders.length > 0 ||
        freeProviders.length > 0 ||
        rentProviders.length > 0 ||
        buyProviders.length > 0;

    return (
        <div className="watch-page">

            <div className="watch-background"></div>

            <div className="watch-container">

                <button
                    className="watch-back-button"
                    onClick={() => navigate(-1)}
                >
                    <span>{"\u2190"}</span>
                    Back
                </button>

                <header className="watch-header">

                    <div className="watch-header-icon">
                        {"\u2316"}
                    </div>

                    <div>
                        <p className="watch-eyebrow">
                            WHERE TO WATCH
                        </p>

                        <h1>
                            Watch Now
                        </h1>

                        <p>
                            Find legitimate viewing options available
                            in your region.
                        </p>
                    </div>

                </header>

                {!region && (

                    <section className="region-panel">

                        <div className="panel-heading">

                            <div>
                                <p className="watch-eyebrow">
                                    STEP 01
                                </p>

                                <h2>
                                    Choose your region
                                </h2>

                                <p>
                                    Streaming availability changes
                                    depending on your location.
                                </p>
                            </div>

                            <div className="location-icon">
                                {"\u2316"}
                            </div>

                        </div>

                        <div className="region-selector">
                            <button
                                type="button"
                                className="region-select-trigger"
                                onClick={() => {
                                    setRegionDropdownOpen((open) => !open);
                                }}
                            >
                                <span>
                                    {selectedRegion
                                        ? selectedRegion.english_name
                                        : "Select your region"}
                                </span>

                                <span className="region-select-arrow">
                                    
                                </span>
                            </button>

                            {regionDropdownOpen && (
                                <div className="region-dropdown">
                                    <input
                                        type="text"
                                        className="region-search"
                                        value={regionSearch}
                                        autoFocus
                                        placeholder="Search your region..."
                                        onChange={(event) => {
                                            setRegionSearch(event.target.value);
                                        }}
                                    />

                                    <div className="region-list">
                                        {regions
                                            .filter((item) =>
                                                item.english_name
                                                    .toLowerCase()
                                                    .includes(
                                                        regionSearch
                                                            .trim()
                                                            .toLowerCase()
                                                    )
                                            )
                                            .map((item) => (
                                                <button
                                                    key={item.iso_3166_1}
                                                    type="button"
                                                    className="region-option"
                                                    onClick={() => {
                                                        handleRegionSelect(
                                                            item.iso_3166_1
                                                        );
                                                        setRegionDropdownOpen(
                                                            false
                                                        );
                                                        setRegionSearch("");
                                                    }}
                                                >
                                                    <span className="region-name">
                                                        {item.english_name}
                                                    </span>

                                                    <span className="region-code">
                                                        {item.iso_3166_1}
                                                    </span>
                                                </button>
                                            ))}

                                        {regions.filter((item) =>
                                            item.english_name
                                                .toLowerCase()
                                                .includes(
                                                    regionSearch
                                                        .trim()
                                                        .toLowerCase()
                                                )
                                        ).length === 0 && (
                                            <div className="region-no-results">
                                                No regions found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div></section>

                )}

                {region && (

                    <section className="results-panel">

                        <div className="selected-region-bar">

                            <div className="selected-region-info">

                                <span className="selected-flag">
                                    {selectedRegion?.flag}
                                </span>

                                <div>
                                    <span>
                                        WATCHING IN
                                    </span>

                                    <strong>
                                        {selectedRegion?.english_name}
                                    </strong>
                                </div>

                            </div>

                            <button
                                className="change-region-button"
                                onClick={() => {
                                    setRegion("");
                                    setProviders(null);
                                    setError("");
                                }}
                            >
                                Change Region
                            </button>

                        </div>

                        {loading && (

                            <div className="provider-loading">

                                <div className="loading-ring"></div>

                                <h2>
                                    Finding viewing options
                                </h2>

                                <p>
                                    Checking legitimate providers
                                    in {selectedRegion?.english_name}...
                                </p>

                            </div>

                        )}

                        {error && (

                            <div className="watch-error">
                                <span>!</span>
                                <div>
                                    <h3>
                                        Something went wrong
                                    </h3>
                                    <p>{error}</p>
                                </div>
                            </div>

                        )}

                        {!loading && !error && providers && (

                            <>

                                {hasProviders ? (

                                    <>

                                        <div className="provider-intro">
                                            <p className="watch-eyebrow">
                                                STEP 02
                                            </p>

                                            <h2>
                                                Choose where to watch
                                            </h2>

                                            <p>
                                                These are the legitimate
                                                viewing options currently
                                                available in your selected
                                                region.
                                            </p>
                                        </div>

                                        {includedProviders.length > 0 && (

                                            <ProviderGroup
                                                title="Stream"
                                                subtitle="Included with a subscription"
                                                icon={"▶"}
                                                providers={includedProviders}
                                                tmdbLink={providerGroups?.link}
                                            />

                                        )}

                                        {freeProviders.length > 0 && (

                                            <ProviderGroup
                                                title="Free"
                                                subtitle="Watch for free or with ads"
                                                icon={"▶"}
                                                providers={freeProviders}
                                                mediaTitle={title}
                                                tmdbLink={providerGroups?.link}
                                            />

                                        )}

                                        {rentProviders.length > 0 && (

                                            <ProviderGroup
                                                title="Rent"
                                                subtitle="Rent this title"
                                                icon={"$"}
                                                providers={rentProviders}
                                                tmdbLink={providerGroups?.link}
                                            />

                                        )}

                                        {buyProviders.length > 0 && (

                                            <ProviderGroup
                                                title="Buy"
                                                subtitle="Purchase this title"
                                                icon={"$"}
                                                providers={buyProviders}
                                                tmdbLink={providerGroups?.link}
                                            />

                                        )}

                                        {providerGroups?.link && (

                                            <div className="tmdb-link-box">

                                                <div>
                                                    <span>
                                                        More availability
                                                    </span>

                                                    <p>
                                                        See all official
                                                        viewing options
                                                        for this title.
                                                    </p>
                                                </div>

                                                <a
                                                    href={providerGroups.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View on TMDB {"\u2192"}
                                                </a>

                                            </div>

                                        )}

                                    </>

                                ) : (

                                    <div className="no-providers">

                                        <div className="no-provider-icon">
                                            {"\u2316"}
                                        </div>

                                        <h2>
                                            No viewing options found
                                        </h2>

                                        <p>
                                            There are currently no
                                            streaming, free, rental or
                                            purchase options available
                                            for this title in{" "}
                                            {selectedRegion?.english_name}.
                                        </p>

                                        <button
                                            className="change-region-button"
                                            onClick={() => {
                                                setRegion("");
                                                setProviders(null);
                                            }}
                                        >
                                            Try Another Region
                                        </button>

                                    </div>

                                )}

                            </>

                        )}

                    </section>

                )}

                <footer className="watch-footer">
                    <span>NextInQueue</span>
                    <span>|</span>
                    <span>Provider availability powered by TMDB</span>
                </footer>

            </div>

        </div>
    );
}

function ProviderGroup({
    title,
    subtitle,
    icon,
    providers,
    tmdbLink,
    mediaTitle
}) {

    const getProviderUrl = (provider) => {

        const name = provider.provider_name.toLowerCase();

        if (title === "Free" && mediaTitle && name.includes("youtube")) {
            return `https://www.youtube.com/results?search_query=${encodeURIComponent(mediaTitle)}`;
        }

        return tmdbLink || "#";
    };

    return (

        <section className="provider-group">

            <div className="provider-heading">

                <div className="provider-heading-icon">
                    {icon}
                </div>

                <div>
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>

                <span className="provider-count">
                    {providers.length}
                </span>

            </div>

            <div className="provider-grid">

                {providers.map((provider) => {

                    const providerUrl = getProviderUrl(provider);

                    return (

                        <a
                            className="provider-card"
                            key={provider.provider_id}
                            href={providerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >

                            <div className="provider-logo">

                                {provider.logo_path ? (

                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                                        alt={provider.provider_name}
                                    />

                                ) : (

                                    <span>{"\u2190"}</span>

                                )}

                            </div>

                            <div className="provider-card-info">

                                <h3>
                                    {provider.provider_name}
                                </h3>

                                <span>
                                    Available in your region
                                </span>

                            </div>

                            <span className="provider-arrow">
                                {"\u2316"}
                            </span>

                        </a>

                    );

                })}

            </div>

        </section>
    );
}
export default WatchNow;








