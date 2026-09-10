import React, {
  useEffect,
  useState,
} from "react";

import {
  getStats,
  getHistory,
} from "../api";

import {
  BarChart3,
  AlertTriangle,
  Gamepad2,
  Trophy,
  Percent,
  Flame,
  Target,
  Star,
  Clapperboard,
  Check,
  X,
} from "lucide-react";


/* =========================================================
   DATE FORMAT
========================================================= */

function formatHistoryDate(dateString) {
  if (!dateString) {
    return "";
  }

  const [year, month, day] =
    dateString.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [stats, setStats] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  useEffect(() => {
    loadDashboard();
  }, []);


  async function loadDashboard() {
    try {
      setLoading(true);

      const [
        statsData,
        historyData,
      ] = await Promise.all([
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
      <div className="flex min-h-[calc(100vh-62px)] w-full items-center justify-center bg-[#080808]">

        <div className="text-center">

          <div className="mb-5 flex justify-center">

            <BarChart3
              size={32}
              strokeWidth={1.5}
              className="text-[#d99a22]"
            />

          </div>


          <p className="font-['Georgia'] text-[22px] font-bold text-[#e3a32d]">
            YOUR STATS
          </p>


          <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#68635d]">
            Loading your performance...
          </p>


          <div className="mx-auto mt-6 h-6 w-6 animate-spin rounded-full border-2 border-[#3b3020] border-t-[#d99a22]" />

        </div>

      </div>
    );
  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (!stats) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-62px)] w-full max-w-[1000px] items-center justify-center px-5">

        <div className="w-full max-w-[560px] rounded-[16px] border border-[#49371f] bg-[#151515] p-8 text-center">


          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#694b1b] bg-[#1c1812]">

            <AlertTriangle
              size={25}
              strokeWidth={1.5}
              className="text-[#d99a22]"
            />

          </div>


          <h2 className="font-['Georgia'] text-[25px] font-bold text-[#e5a32c]">
            Unable to Load Statistics
          </h2>


          <p className="mt-3 text-[13px] text-[#77736d]">
            Please try again later.
          </p>


        </div>

      </div>
    );
  }


  /* =========================================================
     MAIN DASHBOARD
  ========================================================= */

  return (
    <div className="w-full bg-[#080808]">

      <div className="mx-auto w-full max-w-[1000px] px-5 pb-24 pt-10 max-[700px]:px-4">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-9 text-center">

          <div className="mb-2 flex justify-center">

            <BarChart3
              size={28}
              strokeWidth={1.5}
              className="text-[#d99a22]"
            />

          </div>


          <h1 className="m-0 font-['Georgia'] text-[39px] font-bold tracking-[-0.025em] text-[#e4a32d] max-[600px]:text-[32px]">
            YOUR STATS
          </h1>


          <p className="mt-2 text-[12px] text-[#706b64]">
            Daily Challenge performance
          </p>

        </div>


        {/* =================================================
            PRIMARY STATS
        ================================================= */}

        <div className="mx-auto grid max-w-[700px] grid-cols-3 gap-3 max-[700px]:grid-cols-2 max-[450px]:grid-cols-1">


          {/* GAMES PLAYED */}

          <StatCard
            icon={
              <Gamepad2
                size={18}
                strokeWidth={1.7}
              />
            }
            value={stats.games_played}
            label="Games Played"
          />


          {/* WINS */}

          <StatCard
            icon={
              <Trophy
                size={18}
                strokeWidth={1.7}
              />
            }
            value={stats.games_won}
            label="Wins"
          />


          {/* WIN RATE */}

          <StatCard
            icon={
              <Percent
                size={18}
                strokeWidth={1.7}
              />
            }
            value={`${stats.win_rate}%`}
            label="Win Rate"
          />


          {/* CURRENT STREAK */}

          <StatCard
            icon={
              <Flame
                size={18}
                strokeWidth={1.7}
              />
            }
            value={stats.current_streak}
            label="Current Streak"
          />


          {/* LONGEST STREAK */}

          <StatCard
            icon={
              <Flame
                size={18}
                strokeWidth={1.7}
              />
            }
            value={stats.best_streak}
            label="Longest Streak"
          />


          {/* AVG GUESSES */}

          <StatCard
            icon={
              <Target
                size={18}
                strokeWidth={1.7}
              />
            }
            value={stats.average_guesses}
            label="Avg Guesses"
          />

        </div>


        {/* =================================================
            SCORE STATS
        ================================================= */}

        <div className="mx-auto mt-3 grid max-w-[470px] grid-cols-2 gap-3 max-[450px]:grid-cols-1">


          {/* TOTAL SCORE */}

          <StatCard
            icon={
              <Star
                size={18}
                strokeWidth={1.7}
              />
            }
            value={stats.total_score}
            label="Total Score"
          />


          {/* AVERAGE SCORE */}

          <StatCard
            icon={
              <Star
                size={18}
                strokeWidth={1.7}
              />
            }
            value={
              stats.games_played
                ? Math.round(
                    stats.total_score /
                    stats.games_played
                  )
                : 0
            }
            label="Average Score"
          />

        </div>


        {/* =================================================
            DAILY HISTORY
        ================================================= */}

        <section className="mx-auto mt-10 max-w-[700px]">


          <div className="mb-4">

            <h2 className="m-0 font-['Georgia'] text-[20px] font-bold text-[#e3a32d]">
              DAILY HISTORY
            </h2>

          </div>


          {/* =================================================
              EMPTY HISTORY
          ================================================= */}

          {history.length === 0 ? (

            <div className="rounded-[14px] border border-dashed border-[#3d3427] bg-[#111111] px-6 py-12 text-center">


              <div className="mb-4 flex justify-center">

                <Clapperboard
                  size={28}
                  strokeWidth={1.5}
                  className="text-[#d99a22]"
                />

              </div>


              <h3 className="font-['Georgia'] text-[17px] font-bold text-[#ddd5c8]">
                No games played yet
              </h3>


              <p className="mt-2 text-[12px] text-[#68635d]">
                Play today's game to start building your history.
              </p>


            </div>

          ) : (


            /* =================================================
               HISTORY LIST
            ================================================= */

            <div className="overflow-hidden rounded-[14px] border border-[#443521] bg-[#151515]">

              {history.map(
                (game, index) => {

                  const won =
                    game.status === "WON";


                  return (
                    <div
                      key={`${game.game_date}-${index}`}
                      className="flex items-center justify-between gap-5 border-b border-[#30291f] px-5 py-4 last:border-b-0 hover:bg-[#1a1815] max-[600px]:px-4"
                    >


                      {/* =====================================
                          DATE + RESULT
                      ===================================== */}

                      <div className="min-w-0">

                        <p className="m-0 font-['Georgia'] text-[14px] font-bold text-[#e1d9cc]">

                          {formatHistoryDate(
                            game.game_date
                          )}

                        </p>


                        <p
                          className={`
                            mt-1 flex
                            items-center
                            gap-1.5
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.06em]
                            ${
                              won
                                ? "text-[#62bd8a]"
                                : "text-[#c56b5c]"
                            }
                          `}
                        >

                          {won ? (
                            <Check
                              size={12}
                              strokeWidth={2.2}
                            />
                          ) : (
                            <X
                              size={12}
                              strokeWidth={2.2}
                            />
                          )}


                          <span>
                            {won
                              ? "Won"
                              : "Lost"}
                          </span>


                          <span>
                            ·
                          </span>


                          <span>
                            {game.attempts}{" "}
                            {game.attempts === 1
                              ? "guess"
                              : "guesses"}
                          </span>


                          <span>
                            ·
                          </span>


                          <span>
                            {game.score} pts
                          </span>

                        </p>

                      </div>


                      {/* =====================================
                          GUESS DOTS
                      ===================================== */}

                      <div className="flex shrink-0 items-center gap-1.5">

                        {[1, 2, 3, 4, 5].map(
                          (attempt) => {

                            const active =
                              attempt <=
                              game.attempts;


                            return (
                              <span
                                key={attempt}
                                className={`
                                  h-[21px]
                                  w-[21px]
                                  rounded-full
                                  border
                                  ${
                                    active
                                      ? won &&
                                        attempt ===
                                          game.attempts
                                        ? "border-[#5bc98e] bg-[#28a96b]"
                                        : "border-[#76521d] bg-[#5e431c]"
                                      : "border-[#393939] bg-[#242424]"
                                  }
                                `}
                              />
                            );

                          }
                        )}

                      </div>


                    </div>
                  );

                }
              )}

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
  icon,
  value,
  label,
}) {
  return (
    <div className="group relative overflow-hidden rounded-[14px] border border-[#453621] bg-[#161616] px-4 py-5 text-center transition duration-200 hover:-translate-y-0.5 hover:border-[#70521f] hover:bg-[#191816]">


      {/* =================================================
          GOLD TOP LINE
      ================================================= */}

      <div className="absolute left-1/4 right-1/4 top-0 h-px bg-gradient-to-r from-transparent via-[#b67d1d] to-transparent opacity-70" />


      {/* =================================================
          ICON
      ================================================= */}

      <div className="mb-3 flex justify-center text-[#d99a22]">

        {icon}

      </div>


      {/* =================================================
          VALUE
      ================================================= */}

      <strong className="block font-['Georgia'] text-[28px] font-bold leading-none text-[#eee8dd]">
        {value}
      </strong>


      {/* =================================================
          LABEL
      ================================================= */}

      <span className="mt-2 block text-[9px] font-semibold uppercase tracking-[0.11em] text-[#716c65]">
        {label}
      </span>


    </div>
  );
}


export default Dashboard;