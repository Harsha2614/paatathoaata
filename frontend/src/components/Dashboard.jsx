import React, { useEffect, useState } from "react";

import {
  getStats,
  getHistory,
} from "../api";


function Dashboard() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadDashboard();
  }, []);


  async function loadDashboard() {
    try {
      const [statsData, historyData] =
        await Promise.all([
          getStats(),
          getHistory(),
        ]);

      setStats(statsData);
      setHistory(historyData);

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  }


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] w-full items-center justify-center px-6 py-20">

        <div className="flex flex-col items-center gap-4">

          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-[#8b5cf6] border-r-[#3b82f6]" />

          <p className="text-sm text-[#a4a4b2]">
            Loading statistics...
          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     ERROR
     ========================================================= */

  if (!stats) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1100px] items-center justify-center px-6 py-20 max-[700px]:px-4">

        <div className="w-full max-w-[600px] rounded-[20px] border border-white/[0.09] bg-white/[0.045] p-8 text-center shadow-[0_25px_70px_rgba(0,0,0,0.25)]">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[16px] bg-red-500/10 text-2xl">
            ⚠️
          </div>

          <h2 className="mb-2 font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.03em] text-white">
            Unable to load statistics
          </h2>

          <p className="text-sm text-[#a4a4b2]">
            Please try again later.
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="w-full">

      <div className="mx-auto w-full max-w-[1100px] px-6 pb-[100px] pt-20 max-[700px]:px-4 max-[700px]:pb-[70px] max-[700px]:pt-12">


        {/* =====================================================
            HEADER
            ===================================================== */}

        <div className="mb-10">

          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#a78bfa]">
            Your Statistics
          </p>

          <h1 className="m-0 bg-gradient-to-r from-white via-[#b7a6ff] to-[#75a7ff] bg-clip-text font-['Space_Grotesk'] text-[clamp(36px,5vw,52px)] font-bold leading-[1.05] tracking-[-0.055em] text-transparent">
            Dashboard
          </h1>

        </div>


        {/* =====================================================
            STAT CARDS
            ===================================================== */}

        <div className="grid grid-cols-4 gap-3.5 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1">

          <StatCard
            label="Current Streak"
            value={stats.current_streak}
            icon="🔥"
          />

          <StatCard
            label="Best Streak"
            value={stats.best_streak}
            icon="🏆"
          />

          <StatCard
            label="Games Played"
            value={stats.games_played}
            icon="🎵"
          />

          <StatCard
            label="Wins"
            value={stats.games_won}
            icon="✓"
          />

          <StatCard
            label="Average Guesses"
            value={stats.average_guesses}
            icon="🎯"
          />

          <StatCard
            label="Total Score"
            value={stats.total_score}
            icon="⭐"
          />

          <StatCard
            label="Win Rate"
            value={`${stats.win_rate}%`}
            icon="📈"
          />

        </div>


        {/* =====================================================
            GAME HISTORY
            ===================================================== */}

        <section className="mt-12">

          <div className="mb-5 flex items-end justify-between">

            <div>

              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#696977]">
                Your Games
              </p>

              <h2 className="m-0 font-['Space_Grotesk'] text-[25px] font-bold tracking-[-0.03em] text-white">
                Game History
              </h2>

            </div>

            {history.length > 0 && (
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#696977]">
                {history.length}{" "}
                {history.length === 1
                  ? "Game"
                  : "Games"}
              </span>
            )}

          </div>


          {history.length === 0 ? (

            /* EMPTY STATE */

            <div className="rounded-[20px] border border-dashed border-white/[0.10] bg-white/[0.025] px-6 py-14 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-white/[0.05] text-2xl">
                🎵
              </div>

              <h3 className="mb-2 font-['Space_Grotesk'] text-lg font-semibold text-white">
                No games played yet
              </h3>

              <p className="m-0 text-sm text-[#696977]">
                Play today's game to start building
                your history.
              </p>

            </div>

          ) : (

            /* HISTORY LIST */

            <div className="overflow-hidden rounded-[20px] border border-white/[0.09] bg-white/[0.035]">

              {/* TABLE HEADER */}

              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-white/[0.08] bg-white/[0.025] px-5 py-3.5 max-[600px]:grid-cols-[1.4fr_1fr_1fr] max-[600px]:px-4">

                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#696977]">
                  Date
                </span>

                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#696977]">
                  Result
                </span>

                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#696977]">
                  Guesses
                </span>

                <span className="text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#696977] max-[600px]:hidden">
                  Score
                </span>

              </div>


              {/* HISTORY ROWS */}

              {history.map((game, index) => {

                const won =
                  game.status === "WON";

                return (
                  <div
                    key={`${game.game_date}-${index}`}
                    className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center border-b border-white/[0.06] px-5 py-4 transition duration-200 last:border-b-0 hover:bg-white/[0.025] max-[600px]:grid-cols-[1.4fr_1fr_1fr] max-[600px]:px-4"
                  >

                    {/* DATE */}

                    <span className="font-['DM_Sans'] text-[13px] font-medium text-[#d7d7df]">
                      {game.game_date}
                    </span>


                    {/* RESULT */}

                    <div>

                      <span
                        className={`
                          inline-flex items-center rounded-full
                          border px-2.5 py-1
                          text-[10px] font-bold uppercase
                          tracking-[0.06em]
                          ${
                            won
                              ? "border-green-400/20 bg-green-400/[0.08] text-green-300"
                              : "border-red-400/20 bg-red-400/[0.08] text-red-300"
                          }
                        `}
                      >
                        {won
                          ? "Won"
                          : "Lost"}
                      </span>

                    </div>


                    {/* GUESSES */}

                    <span className="text-[13px] text-[#a4a4b2]">
                      {game.attempts}
                    </span>


                    {/* SCORE */}

                    <strong className="text-right font-['Space_Grotesk'] text-[14px] font-semibold text-white max-[600px]:hidden">
                      {game.score} pts
                    </strong>

                  </div>
                );

              })}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}


/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  label,
  value,
  icon,
}) {
  return (
    <div className="group relative overflow-hidden rounded-[18px] border border-white/[0.09] bg-white/[0.045] px-5 py-[22px] transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.06] hover:shadow-[0_15px_40px_rgba(0,0,0,0.18)]">

      {/* TOP GRADIENT */}

      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf655] to-transparent opacity-60 transition duration-200 group-hover:via-[#8b5cf6aa]" />


      {/* ICON */}

      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#8b5cf621] to-[#3b82f614] text-base">
        {icon}
      </div>


      {/* VALUE */}

      <strong className="block font-['Space_Grotesk'] text-[29px] font-bold leading-none tracking-[-0.04em] text-white">
        {value}
      </strong>


      {/* LABEL */}

      <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#696977]">
        {label}
      </span>

    </div>
  );
}


export default Dashboard;