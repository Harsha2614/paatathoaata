import React, { useEffect, useState } from "react";
import "./App.css";
import {
  initializeAnonymousPlayer,
  getCurrentUser,
} from "./api";

import Game from "./components/Game";
import Dashboard from "./components/Dashboard";
import TimeMachine from "./components/TimeMachine";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";


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
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    initializePlayer();
  }, []);

  async function initializePlayer() {
    try {
      setLoading(true);
      setError("");

      const player = await initializeAnonymousPlayer();

      setUser(player);

    } catch (error) {
      console.error(error);
      setError(error.message);

    } finally {
      setLoading(false);
    }
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#08080d] px-5">
        <div className="text-center">
          <h1 className="font-['Space_Grotesk'] text-4xl font-bold tracking-[-0.04em] text-white">
            GuessTheSong
          </h1>

          <p className="mt-3 text-sm text-[#a4a4b2]">
            Your game is getting ready...
          </p>

          <div className="mx-auto mt-6 h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#8b5cf6]" />
        </div>
      </div>
    );
  }


  /* =========================
     ERROR
  ========================= */

  if (error || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#08080d] px-5">
        <div className="w-full max-w-md rounded-[20px] border border-white/[0.09] bg-white/[0.045] p-8 text-center shadow-[0_25px_70px_rgba(0,0,0,0.35)]">

          <h1 className="font-['Space_Grotesk'] text-4xl font-bold tracking-[-0.04em] text-white">
            GuessTheSong
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#a4a4b2]">
            {error || "Unable to start the game."}
          </p>

          <button
            onClick={initializePlayer}
            className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-[12px] border-0 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(99,102,241,0.25)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(99,102,241,0.35)]"
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }


  /* =========================
     PLAYER LAYOUT
  ========================= */

  return (
    <div className="min-h-screen w-full bg-[#08080d] text-white">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#08080d]/90 backdrop-blur-xl">

        <div className="mx-auto flex h-[72px] w-full max-w-[1200px] items-center justify-between px-6 max-[700px]:px-4">

          {/* Logo */}

          <button
            onClick={() => {
              setSelectedDate(null);
              setPage("game");
            }}
            className="border-0 bg-transparent p-0 font-['Space_Grotesk'] text-[21px] font-bold tracking-[-0.04em] text-white transition hover:opacity-80"
          >
            GuessTheSong
          </button>


          {/* Navigation */}

          <nav className="flex items-center gap-1 rounded-[14px] border border-white/[0.07] bg-white/[0.035] p-1 max-[700px]:gap-0">

            {/* Game */}

            <button
              onClick={() => {
                setSelectedDate(null);
                setPage("game");
              }}
              className={`rounded-[10px] border-0 px-4 py-2.5 text-[13px] font-semibold transition duration-200 max-[700px]:px-2.5 ${
                page === "game"
                  ? "bg-white/[0.09] text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
                  : "bg-transparent text-[#858592] hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <span className="mr-1.5">🎵</span>
              <span className="max-[520px]:hidden">
                Game
              </span>
            </button>


            {/* Stats */}

            <button
              onClick={() => {
                setSelectedDate(null);
                setPage("dashboard");
              }}
              className={`rounded-[10px] border-0 px-4 py-2.5 text-[13px] font-semibold transition duration-200 max-[700px]:px-2.5 ${
                page === "dashboard"
                  ? "bg-white/[0.09] text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
                  : "bg-transparent text-[#858592] hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <span className="mr-1.5">📊</span>
              <span className="max-[520px]:hidden">
                Stats
              </span>
            </button>


            {/* Time Machine */}

            <button
              onClick={() => {
                setSelectedDate(null);
                setPage("time-machine");
              }}
              className={`rounded-[10px] border-0 px-4 py-2.5 text-[13px] font-semibold transition duration-200 max-[700px]:px-2.5 ${
                page === "time-machine"
                  ? "bg-white/[0.09] text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
                  : "bg-transparent text-[#858592] hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <span className="mr-1.5">🕘</span>
              <span className="max-[520px]:hidden">
                Time Machine
              </span>
            </button>

          </nav>

        </div>

      </header>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="w-full">

        {page === "game" && (
          <Game
            selectedDate={selectedDate}
          />
        )}


        {page === "dashboard" && (
          <Dashboard />
        )}


        {page === "time-machine" && (
          <TimeMachine
            onSelectDate={(date) => {
              setSelectedDate(date);
              setPage("game");
            }}
          />
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


  /* =========================
     ADMIN LOADING
  ========================= */

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#08080d] px-5">

        <div className="text-center">

          <h1 className="font-['Space_Grotesk'] text-4xl font-bold tracking-[-0.04em] text-white">
            GuessTheSong
          </h1>

          <p className="mt-3 text-sm text-[#a4a4b2]">
            Loading admin...
          </p>

          <div className="mx-auto mt-6 h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#8b5cf6]" />

        </div>

      </div>
    );
  }


  /* =========================
     ADMIN LOGIN
  ========================= */

  if (!user) {
    return (
      <AdminLogin
        onLogin={setUser}
      />
    );
  }


  /* =========================
     ADMIN DASHBOARD
  ========================= */

  return (
    <AdminDashboard
      user={user}
    />
  );
}


export default App;