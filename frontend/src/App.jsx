import React, { useEffect, useState } from "react";

import {
  initializeAnonymousPlayer,
  getCurrentUser,
} from "./api";

import Game from "./components/Game";
import Dashboard from "./components/Dashboard";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

import "./App.css";


function App() {
  const isAdminRoute =
    window.location.pathname === "/admin";

  if (isAdminRoute) {
    return <AdminApp />;
  }

  return <PlayerApp />;
}


/* =========================
   PLAYER APP
========================= */

function PlayerApp() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("game");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    initializePlayer();
  }, []);

  async function initializePlayer() {
    try {
      setLoading(true);

      const player =
        await initializeAnonymousPlayer();

      setUser(player);

    } catch (error) {
      console.error(error);
      setError(error.message);

    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="app-loading">
        <h1>GuessTheSong</h1>
        <p>Your game is getting ready...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="app-loading">

        <h1>GuessTheSong</h1>

        <p>
          {error || "Unable to start the game."}
        </p>

        <button onClick={initializePlayer}>
          Try Again
        </button>

      </div>
    );
  }

  return (
    <div className="app">

      <header className="navbar">

        <div className="logo">
          GuessTheSong
        </div>

        <nav>

          <button
            className={
              page === "game"
                ? "active"
                : ""
            }
            onClick={() => setPage("game")}
          >
            🎵 Game
          </button>

          <button
            className={
              page === "dashboard"
                ? "active"
                : ""
            }
            onClick={() => setPage("dashboard")}
          >
            📊 Stats
          </button>

        </nav>

      </header>

      <main>

        {page === "game" && <Game />}

        {page === "dashboard" && (
          <Dashboard />
        )}

      </main>

    </div>
  );
}


/* =========================
   ADMIN APP
========================= */

function AdminApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminSession();
  }, []);

  async function checkAdminSession() {
    try {
      const currentUser =
        await getCurrentUser();

      if (currentUser.role === "ADMIN") {
        setUser(currentUser);
      }

    } catch (error) {
      console.log("No admin session");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="app-loading">
        <h1>GuessTheSong</h1>
        <p>Loading admin...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <AdminLogin
        onLogin={setUser}
      />
    );
  }

  return (
    <AdminDashboard
      user={user}
    />
  );
}


export default App;