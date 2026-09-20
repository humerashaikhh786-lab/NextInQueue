import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Settings.css";

const themes = [
    {
        id: "dark-cinematic",
        name: "Dark Cinematic",
        description: "A cinematic dark interface for immersive browsing.",
        preview: "dark",
    },
    {
        id: "light",
        name: "Light",
        description: "A clean and bright interface.",
        preview: "light",
    },
    {
        id: "navy",
        name: "Navy",
        description: "A deep navy entertainment-inspired interface.",
        preview: "navy",
    },
    {
        id: "blue",
        name: "Blue",
        description: "A modern blue interface.",
        preview: "blue",
    },
    {
        id: "purple",
        name: "Midnight Purple",
        description: "A rich purple interface with a cinematic feel.",
        preview: "purple",
    },
    {
        id: "emerald",
        name: "Emerald",
        description: "A deep green interface with a fresh atmosphere.",
        preview: "emerald",
    },
    {
        id: "sunset",
        name: "Sunset",
        description: "A warm interface inspired by evening colors.",
        preview: "sunset",
    },
    {
        id: "rose",
        name: "Rose",
        description: "A dark rose interface with a modern mood.",
        preview: "rose",
    },
    {
        id: "monochrome",
        name: "Monochrome",
        description: "A sleek black and white interface.",
        preview: "monochrome",
    },
    {
        id: "crimson",
        name: "Crimson",
        description: "A bold dark interface with crimson accents.",
        preview: "crimson",
    },
    {
        id: "ocean",
        name: "Ocean",
        description: "A deep ocean-inspired interface.",
        preview: "ocean",
    },
    {
        id: "aurora",
        name: "Aurora",
        description: "A cool interface inspired by northern lights.",
        preview: "aurora",
    },
    {
        id: "teal",
        name: "Teal",
        description: "A dark teal interface with modern accents.",
        preview: "teal",
    },
    {
        id: "forest",
        name: "Forest",
        description: "A rich forest-green interface.",
        preview: "forest",
    },
    {
        id: "amber",
        name: "Amber",
        description: "A warm dark interface with amber tones.",
        preview: "amber",
    },
    {
        id: "violet",
        name: "Violet",
        description: "A dramatic violet entertainment interface.",
        preview: "violet",
    },
    {
        id: "graphite",
        name: "Graphite",
        description: "A refined graphite interface.",
        preview: "graphite",
    },
    {
        id: "mint",
        name: "Mint",
        description: "A cool mint interface with soft contrast.",
        preview: "mint",
    },
    {
        id: "coral",
        name: "Coral",
        description: "A warm coral-inspired dark interface.",
        preview: "coral",
    },
    {
        id: "indigo",
        name: "Indigo",
        description: "A deep indigo interface for immersive browsing.",
        preview: "indigo",
    },
];

const THEME_KEY = "nextinqueue-theme";

const themeValues = {
    "dark-cinematic": {
        bg: "#070b12",
        panel: "#101723",
        text: "#ffffff",
        muted: "#8b98aa",
        border: "rgba(255,255,255,0.10)",
        input: "#0d141f",
    },
    purple: {
        bg: "#12091f",
        panel: "#1d1030",
        text: "#ffffff",
        muted: "#b9a5cf",
        border: "rgba(185,165,207,0.18)",
        input: "#160c27",
    },
    emerald: {
        bg: "#071711",
        panel: "#0d241b",
        text: "#ffffff",
        muted: "#9fc5b3",
        border: "rgba(159,197,179,0.18)",
        input: "#091d15",
    },
    sunset: {
        bg: "#1b0e0a",
        panel: "#2b1710",
        text: "#ffffff",
        muted: "#d3afa0",
        border: "rgba(211,175,160,0.18)",
        input: "#21100b",
    },
    rose: {
        bg: "#1a0a12",
        panel: "#2a101c",
        text: "#ffffff",
        muted: "#d0a9b9",
        border: "rgba(208,169,185,0.18)",
        input: "#210c17",
    },
    monochrome: {
        bg: "#0a0a0a",
        panel: "#171717",
        text: "#ffffff",
        muted: "#a3a3a3",
        border: "rgba(255,255,255,0.14)",
        input: "#111111",
    },
    crimson: {
        bg: "#18090d",
        panel: "#2a1018",
        text: "#ffffff",
        muted: "#d2a6b0",
        border: "rgba(210,166,176,0.18)",
        input: "#210b11",
    },
    ocean: {
        bg: "#06151f",
        panel: "#0c2635",
        text: "#ffffff",
        muted: "#9dbbc8",
        border: "rgba(157,187,200,0.18)",
        input: "#081e2b",
    },
    aurora: {
        bg: "#08131a",
        panel: "#10242b",
        text: "#ffffff",
        muted: "#a1c8c1",
        border: "rgba(161,200,193,0.18)",
        input: "#0b1c22",
    },
    teal: {
        bg: "#061716",
        panel: "#0b2927",
        text: "#ffffff",
        muted: "#9fc8c5",
        border: "rgba(159,200,197,0.18)",
        input: "#08211f",
    },
    forest: {
        bg: "#07130c",
        panel: "#10271a",
        text: "#ffffff",
        muted: "#9fc0aa",
        border: "rgba(159,192,170,0.18)",
        input: "#091d11",
    },
    amber: {
        bg: "#191107",
        panel: "#2b1c0c",
        text: "#ffffff",
        muted: "#d1b38a",
        border: "rgba(209,179,138,0.18)",
        input: "#211609",
    },
    violet: {
        bg: "#10091a",
        panel: "#211330",
        text: "#ffffff",
        muted: "#b9a9cf",
        border: "rgba(185,169,207,0.18)",
        input: "#170d24",
    },
    graphite: {
        bg: "#101214",
        panel: "#1b1e22",
        text: "#ffffff",
        muted: "#a4abb4",
        border: "rgba(164,171,180,0.18)",
        input: "#15181c",
    },
    mint: {
        bg: "#071512",
        panel: "#0d2820",
        text: "#ffffff",
        muted: "#9fc8b9",
        border: "rgba(159,200,185,0.18)",
        input: "#091e18",
    },
    coral: {
        bg: "#190c0a",
        panel: "#2b1511",
        text: "#ffffff",
        muted: "#d2aaa0",
        border: "rgba(210,170,160,0.18)",
        input: "#21100d",
    },
    indigo: {
        bg: "#0a0b1d",
        panel: "#151936",
        text: "#ffffff",
        muted: "#a7add2",
        border: "rgba(167,173,210,0.18)",
        input: "#0e1230",
    },
    light: {
        bg: "#f5f7fa",
        panel: "#ffffff",
        text: "#18202a",
        muted: "#5f6f82",
        border: "rgba(24,32,42,0.14)",
        input: "#ffffff",
    },
    navy: {
        bg: "#071525",
        panel: "#0d2340",
        text: "#ffffff",
        muted: "#9db1ca",
        border: "rgba(157,177,202,0.18)",
        input: "#0a1d35",
    },
    blue: {
        bg: "#071a32",
        panel: "#0d2c4d",
        text: "#ffffff",
        muted: "#a8c1dc",
        border: "rgba(168,193,220,0.18)",
        input: "#092440",
    },
};

const getStoredTheme = () => {
    if (typeof window === "undefined") return "dark-cinematic";

    const stored = localStorage.getItem(THEME_KEY);

    return themeValues[stored] ? stored : "dark-cinematic";
};

const applyTheme = (themeId) => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const values = themeValues[themeId] || themeValues["dark-cinematic"];

    root.setAttribute("data-nextinqueue-theme", themeId);

    Object.entries(values).forEach(([key, value]) => {
        root.style.setProperty(`--nq-${key}`, value);
    });
};

applyTheme(getStoredTheme());

function ThemeSettings() {
    const navigate = useNavigate();

    const [selectedTheme, setSelectedTheme] = useState(getStoredTheme);
    const [savedTheme, setSavedTheme] = useState(getStoredTheme);

    useEffect(() => {
        const storedTheme = getStoredTheme();

        setSelectedTheme(storedTheme);
        setSavedTheme(storedTheme);
        applyTheme(storedTheme);
    }, []);

    const handleThemeChange = (themeId) => {
        setSelectedTheme(themeId);
        applyTheme(themeId);
    };

    const handleSaveTheme = () => {
        localStorage.setItem(THEME_KEY, selectedTheme);
        setSavedTheme(selectedTheme);
        applyTheme(selectedTheme);
    };

    return (
        <main className="settings-page theme-settings-page">

            <button
                type="button"
                className="settings-back-button"
                onClick={() => navigate(-1)}
            >
                <span>{"\u2190"}</span>
                Back
            </button>

            <header className="settings-hero">
                <div className="settings-eyebrow">
                    <span className="settings-eyebrow-line"></span>
                    APPEARANCE
                </div>

                <h1>Theme</h1>

                <p>
                    Choose how NextInQueue looks and feels across your
                    entertainment experience.
                </p>
            </header>

            <section className="theme-settings-container">

                <div className="theme-section-heading">
                    <div>
                        <span className="settings-group-label">
                            INTERFACE STYLE
                        </span>

                        <h2>Choose your atmosphere</h2>

                        <p>
                            Select a theme for your NextInQueue interface.
                        </p>
                    </div>
                </div>

                <div className="theme-grid">
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            type="button"
                            className={`theme-card ${
                                selectedTheme === theme.id ? "selected" : ""
                            }`}
                            onClick={() => handleThemeChange(theme.id)}
                        >
                            <div className={`theme-preview ${theme.preview}`}>
                                <div className="preview-top"></div>
                                <div className="preview-content">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>

                            <div className="theme-card-bottom">
                                <div>
                                    <h3>{theme.name}</h3>
                                    <p>{theme.description}</p>
                                </div>

                                <span className="theme-radio">
                                    {selectedTheme === theme.id ? "\u2713" : ""}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="theme-info-box">
                    <span>{"\u2726"}</span>
                    <div>
                        <strong>Theme preferences</strong>
                        <p>
                            Your selected theme is applied immediately and
                            can be saved on this device.
                        </p>
                    </div>
                </div>

                <div className="theme-save-row">
                    <button
                        type="button"
                        className="settings-action-button theme-save-button"
                        onClick={handleSaveTheme}
                    >
                        Save Theme
                        <span>{"\u2192"}</span>
                    </button>

                    <span className="theme-save-status">
                        {selectedTheme === savedTheme
                            ? "Theme saved"
                            : "Unsaved changes"}
                    </span>
                </div>

            </section>
        </main>
    );
}

export default ThemeSettings;
