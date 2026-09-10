import React, {
  useEffect,
  useState,
} from "react";

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

import {
  BarChart3,
  CalendarClock,
  Clapperboard,
  CircleHelp,
  Info,
  ShieldAlert,
} from "lucide-react";


/* =========================================================
   APP
========================================================= */

function App() {
  const isAdminRoute =
    window.location.pathname === "/admin";


  if (isAdminRoute) {
    return <AdminApp />;
  }


  return <PlayerApp />;
}


/* =========================================================
   PLAYER APP
========================================================= */

function PlayerApp() {
  const [user, setUser] =
    useState(null);

  const [page, setPage] =
    useState("game");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState(null);


  /* =========================================================
     INITIALIZE PLAYER
  ========================================================= */

  useEffect(() => {
    initializePlayer();
  }, []);


  async function initializePlayer() {
    try {
      setLoading(true);
      setError("");

      const player =
        await initializeAnonymousPlayer();

      setUser(player);

    } catch (error) {
      console.error(error);

      setError(
        error.message ||
        "Unable to start the game."
      );

    } finally {
      setLoading(false);
    }
  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#080808] px-5">

        <div className="text-center">

          <div className="mb-5 flex justify-center">

            <Clapperboard
              size={32}
              strokeWidth={1.5}
              className="text-[#d99a22]"
            />

          </div>


          <h1 className="font-['Georgia'] text-[30px] font-bold tracking-[-0.02em] text-[#e5a32c]">
            ABSOLUTE CINEMA
          </h1>


          <p className="mt-3 text-[12px] uppercase tracking-[0.14em] text-[#716d67]">
            Preparing today's challenge...
          </p>


          <div className="mx-auto mt-6 h-6 w-6 animate-spin rounded-full border-2 border-[#3b3020] border-t-[#d99a22]" />

        </div>

      </div>
    );
  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#080808] px-5">

        <div className="w-full max-w-md rounded-[16px] border border-[#4d3a20] bg-[#151515] p-8 text-center shadow-[0_25px_70px_rgba(0,0,0,0.5)]">


          {/* ERROR ICON */}

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#72501b] bg-[#1d1913]">

            <ShieldAlert
              size={24}
              strokeWidth={1.5}
              className="text-[#d99a22]"
            />

          </div>


          <h1 className="font-['Georgia'] text-[27px] font-bold text-[#e6a52e]">
            ABSOLUTE CINEMA
          </h1>


          <p className="mt-4 text-sm leading-6 text-[#85817b]">
            {error ||
              "Unable to start the game."}
          </p>


          <button
            onClick={initializePlayer}
            className="mt-7 min-h-[46px] rounded-[9px] border border-[#8d641d] bg-gradient-to-b from-[#dca13a] to-[#a97420] px-6 text-[12px] font-bold uppercase tracking-[0.08em] text-[#171109] transition hover:brightness-110"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  /* =========================================================
     PLAYER LAYOUT
  ========================================================= */

  return (
    <div className="min-h-screen w-full bg-[#080808] text-[#e8e2d8]">


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#30281d] bg-[#090909]/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[62px] w-full max-w-[980px] items-center justify-between px-5 max-[700px]:px-4">


          {/* =================================================
              LOGO
          ================================================= */}

          <button
            onClick={() => {
              setSelectedDate(null);
              setPage("game");
            }}
            aria-label="Go to home"
            className="flex items-center gap-2 border-0 bg-transparent p-0"
          >

            <Clapperboard
              size={19}
              strokeWidth={1.6}
              className="text-[#c88d25]"
            />


            <span className="font-['Georgia'] text-[22px] font-bold tracking-[0.06em] text-[#dca02d] max-[600px]:text-[18px]">
              ABSOLUTE CINEMA
            </span>

          </button>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav className="flex items-center gap-1 max-[600px]:gap-0">


            {/* =================================================
                HOME
            ================================================= */}

            <button
              onClick={() => {
                setSelectedDate(null);
                setPage("game");
              }}
              aria-label="Home"
              className={`
                flex
                items-center
                gap-2
                rounded-[11px]
                border
                px-3.5
                py-2
                text-[11px]
                font-bold
                uppercase
                tracking-[0.03em]
                transition
                max-[600px]:px-2.5

                ${
                  page === "game"
                    ? "border-[#7b5419] bg-[#30230f] text-[#e8ad3b] shadow-[0_5px_18px_rgba(160,110,25,0.10)]"
                    : "border-transparent text-[#85817c] hover:text-[#d1cbc1]"
                }
              `}
            >

              <Clapperboard
                size={14}
                strokeWidth={1.7}
              />


              <span className="max-[520px]:hidden">
                HOME
              </span>

            </button>


            {/* =================================================
                STATS
            ================================================= */}

            <button
              onClick={() => {
                setSelectedDate(null);
                setPage("dashboard");
              }}
              aria-label="Stats"
              className={`
                flex
                items-center
                gap-2
                rounded-[11px]
                border
                px-3.5
                py-2
                text-[11px]
                font-bold
                uppercase
                tracking-[0.03em]
                transition
                max-[600px]:px-2.5

                ${
                  page === "dashboard"
                    ? "border-[#7b5419] bg-[#30230f] text-[#e8ad3b]"
                    : "border-transparent text-[#85817c] hover:text-[#d1cbc1]"
                }
              `}
            >

              <BarChart3
                size={14}
                strokeWidth={1.7}
              />


              <span className="max-[520px]:hidden">
                STATS
              </span>

            </button>


            {/* =================================================
                TIME MACHINE
            ================================================= */}

            <button
              onClick={() => {
                setSelectedDate(null);
                setPage("time-machine");
              }}
              aria-label="Time Machine"
              className={`
                flex
                items-center
                gap-2
                rounded-[11px]
                border
                px-3.5
                py-2
                text-[11px]
                font-bold
                uppercase
                tracking-[0.03em]
                transition
                max-[600px]:px-2.5

                ${
                  page === "time-machine"
                    ? "border-[#7b5419] bg-[#30230f] text-[#e8ad3b]"
                    : "border-transparent text-[#85817c] hover:text-[#d1cbc1]"
                }
              `}
            >

              <CalendarClock
                size={14}
                strokeWidth={1.7}
              />


              <span className="max-[520px]:hidden">
                TIME MACHINE
              </span>

            </button>


            {/* =================================================
                HOW TO PLAY
            ================================================= */}

            <button
              onClick={() => {
                /*
                 * Keep this available for your
                 * How To Play implementation.
                 *
                 * Currently the existing app does
                 * not have a how-to-play page/modal.
                 */
              }}
              aria-label="How to play"
              className="flex items-center gap-2 rounded-[11px] border border-transparent px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.03em] text-[#85817c] transition hover:text-[#d1cbc1] max-[600px]:px-2.5"
            >

              <CircleHelp
                size={14}
                strokeWidth={1.7}
              />


              <span className="max-[520px]:hidden">
                HOW TO PLAY
              </span>

            </button>

          </nav>

        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

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


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#242019] bg-[#090909]">

        <div className="mx-auto max-w-[980px] px-5 py-8 text-center">


          {/* FOOTER BRAND */}

          <p className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[#625e58]">

            <Clapperboard
              size={13}
              strokeWidth={1.5}
              className="text-[#806126]"
            />

            <span>
              ABSOLUTE CINEMA
            </span>

            <span className="text-[#403a32]">
              ·
            </span>

            <span>
              New movie daily at 12:00 AM IST
            </span>

          </p>


          {/* FOOTER LINKS */}

          <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-[#807b74] max-[500px]:flex-wrap">

            <button className="transition hover:text-[#dca02d]">
              About Us
            </button>


            <span
              aria-hidden="true"
              className="text-[#403a32]"
            >
              •
            </span>


            <button className="transition hover:text-[#dca02d]">
              Privacy Policy
            </button>


            <span
              aria-hidden="true"
              className="text-[#403a32]"
            >
              •
            </span>


            <button className="transition hover:text-[#dca02d]">
              Terms of Service
            </button>


            <span
              aria-hidden="true"
              className="text-[#403a32]"
            >
              •
            </span>


            <button className="transition hover:text-[#dca02d]">
              Contact Us
            </button>

          </div>


          {/* COPYRIGHT */}

          <p className="mt-5 text-[10px] text-[#4e4a45]">
            © 2026 Absolute Cinema. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   ADMIN APP
========================================================= */

function AdminApp() {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    checkAdminSession();
  }, []);


  async function checkAdminSession() {
    try {

      const currentUser =
        await getCurrentUser();


      if (
        currentUser.role === "ADMIN"
      ) {
        setUser(currentUser);
      }

    } catch (error) {

      console.log(
        "No admin session"
      );

    } finally {

      setLoading(false);

    }
  }


  /* =========================================================
     ADMIN LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#080808] px-5">

        <div className="text-center">

          <div className="mb-5 flex justify-center">

            <Clapperboard
              size={30}
              strokeWidth={1.5}
              className="text-[#d99a22]"
            />

          </div>


          <h1 className="font-['Georgia'] text-[28px] font-bold text-[#e5a32c]">
            ABSOLUTE CINEMA
          </h1>


          <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-[#716d67]">
            Loading admin...
          </p>


          <div className="mx-auto mt-6 h-6 w-6 animate-spin rounded-full border-2 border-[#3b3020] border-t-[#d99a22]" />

        </div>

      </div>
    );
  }


  /* =========================================================
     ADMIN LOGIN
  ========================================================= */

  if (!user) {
    return (
      <AdminLogin
        onLogin={setUser}
      />
    );
  }


  /* =========================================================
     ADMIN DASHBOARD
  ========================================================= */

  return (
    <AdminDashboard
      user={user}
    />
  );
}


export default App;