import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./home/Home";
import ExploreSection from "./explore/ExploreSection";
import MovieSection from "./movies/MovieSection";
import SeriesSection from "./series/SeriesSection";
import AnimeSection from "./anime/AnimeSection";
import GenreSection from "./genre/GenreSection";

import SearchSection from "./search/SearchSection";

import MovieDetails from "./components/MovieDetails";
import WatchNow from "./components/WatchNow";
import ActorProfile from "./components/ActorProfile";

import Login from "./account/Login";
import CreateAccount from "./account/CreateAccount";
import ForgotPassword from "./account/ForgotPassword";
import VerifyOTP from "./account/VerifyOTP";
import ResetPassword from "./account/ResetPassword";
import Profile from "./account/Profile";

import Library from "./library/Library";
import Queue from "./library/Queue";
import Favorites from "./library/Favorites";
import Watched from "./library/Watched";

import Settings from "./settings/Settings";
import DeleteAccount from "./sections/settings/DeleteAccount";
import ThemeSettings from "./settings/ThemeSettings";

import About from "./about/About";

import "./App.css";

function AppContent() {

    const location = useLocation();

    const authPages = [
        "/login",
        "/create-account",
        "/forgot-password",
        "/verify-otp",
        "/reset-password"
    ];

    const isAuthPage = authPages.includes(location.pathname);

    return (
        <>
            {!isAuthPage && <Navbar />}

            <main className={isAuthPage ? "" : "app-content"}>

                <Routes>

                    {/* PUBLIC */}

                    <Route path="/" element={<Home />} />

                    <Route
                        path="/explore"
                        element={<ExploreSection />}
                    />

                    <Route
                        path="/movies"
                        element={<MovieSection />}
                    />

                    <Route
                        path="/series"
                        element={<SeriesSection />}
                    />

                    <Route
                        path="/anime"
                        element={<AnimeSection />}
                    />

                    <Route
                        path="/genres"
                        element={<GenreSection />}
                    />

                    <Route
                        path="/search"
                        element={<SearchSection />}
                    />

                    <Route
                        path="/movie/:id"
                        element={<MovieDetails />}
                    />

                    <Route
                        path="/series/:id"
                        element={<MovieDetails />}
                    />

                    <Route
                        path="/anime/:id"
                        element={<MovieDetails />}
                    />

                    <Route
                        path="/actor/:id"
                        element={<ActorProfile />}
                    />

                    <Route
                        path="/watch/:type/:id"
                        element={<WatchNow />}
                    />

                    <Route
                        path="/about"
                        element={<About />}
                    />

                    {/* AUTH */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/create-account"
                        element={<CreateAccount />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/verify-otp"
                        element={<VerifyOTP />}
                    />

                    <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                    />

                    {/* PROTECTED */}

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/library"
                        element={
                            <ProtectedRoute>
                                <Library />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/library/queue"
                        element={
                            <ProtectedRoute>
                                <Queue />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/library/favorites"
                        element={
                            <ProtectedRoute>
                                <Favorites />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/library/watched"
                        element={
                            <ProtectedRoute>
                                <Watched />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings/delete-account"
                        element={
                            <ProtectedRoute>
                                <DeleteAccount />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings/theme"
                        element={
                            <ProtectedRoute>
                                <ThemeSettings />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />

                </Routes>

            </main>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;





