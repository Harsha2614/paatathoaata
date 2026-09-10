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
  CalendarDays,
  Check,
  Clapperboard,
  CircleHelp,
  Clock3,
  RotateCcw,
  Search,
  Target,
  X,
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
   HOW TO PLAY MODAL
========================================================= */

function HowToPlayModal({ onClose }) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);


  const instructions = [
    {
      icon: Clapperboard,
      title: "Daily Movie",
      description:
        "One movie is selected for the day. Listen to the audio clue and guess it — everyone plays the same challenge.",
    },
    {
      icon: Target,
      title: "Five Guesses",
      description:
        "You get exactly five submitted guesses. Each wrong guess unlocks an easier audio clue.",
    },
    {
      icon: Search,
      title: "Search",
      description:
        "Type the movie name into the search box and select your answer. Searching never costs a guess — only pressing GUESS does.",
    },
    {
      icon: Clock3,
      title: "Time Machine",
      description:
        "Replay any previous day's challenge. Results are tracked separately.",
    },
    {
      icon: RotateCcw,
      title: "Daily Reset",
      description:
        "A brand new movie arrives every day at 12:00 AM IST.",
    },
  ];


  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-8 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-to-play-title"
        className="relative w-full max-w-[460px] overflow-hidden rounded-[12px] border border-[#4a371c] bg-[#111111] shadow-[0_30px_100px_rgba(0,0,0,0.75)]"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >

        {/* TOP GOLD ACCENT */}

        <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#d99a22] to-transparent" />


        {/* HEADER */}

        <div className="relative flex items-center justify-center px-12 pb-4 pt-5">

          <h2
            id="how-to-play-title"
            className="font-['Georgia'] text-[22px] font-bold tracking-[0.01em] text-[#e5a32c]"
          >
            HOW TO PLAY
          </h2>


          {/* CLOSE */}

          <button
            onClick={onClose}
            aria-label="Close how to play"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#75541d] bg-[#18140e] text-[#c79532] transition hover:border-[#b57d1f] hover:bg-[#241c10] hover:text-[#edb84d]"
          >
            <X
              size={17}
              strokeWidth={1.6}
            />
          </button>

        </div>


        {/* CONTENT */}

        <div className="px-5 pb-6 sm:px-6">

          <div className="space-y-1">

            {instructions.map(
              ({
                icon: Icon,
                title,
                description,
              }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-[9px] px-0 py-2.5"
                >

                  {/* ICON */}

                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[#795517] bg-[#241b0d] text-[#d99a22] shadow-[inset_0_0_15px_rgba(190,130,25,0.05)]">

                    <Icon
                      size={15}
                      strokeWidth={1.6}
                    />

                  </div>


                  {/* TEXT */}

                  <div className="min-w-0">

                    <h3 className="text-[14px] font-semibold text-[#e3d4b2]">
                      {title}
                    </h3>

                    <p className="mt-0.5 text-[12px] leading-[1.55] text-[#8e8a84]">
                      {description}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
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

  const [showHowToPlay, setShowHowToPlay] = useState(false);


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
            Cine Clue
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
            CINE CLUE
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
              className="shrink-0 text-[#c88d25]"
            />

            <div className="flex flex-col items-center leading-none">
              <span className="font-['Georgia'] text-[22px] font-bold tracking-[0.06em] text-[#dca02d] max-[600px]:text-[18px]">
                CINE CLUE
              </span>

              <span className="mt-[3px] font-['Georgia'] text-[8px] font-bold tracking-[0.06em] text-[#dca02d] max-[600px]:text-[8px]">
                Listen. Guess. Win.
              </span>
            </div>
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
            onClick={() => setShowHowToPlay(true)}
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

            {showHowToPlay && (
        <HowToPlayModal
          onClose={() => setShowHowToPlay(false)}
        />
      )}


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
              CINE CLUE
              
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
            © 2026 CINE CLUE. All rights reserved.
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
            CINE CLUE
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