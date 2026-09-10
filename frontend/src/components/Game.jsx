import React, { useEffect, useState } from "react";

import {
  getTodayGame,
  getGameByDate,
  submitGuess,
} from "../api";


const SCORE_BY_ATTEMPT = {
  1: 100,
  2: 80,
  3: 60,
  4: 40,
  5: 20,
};


function getCurrentDate() {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


function Game({ selectedDate }) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guess, setGuess] = useState("");
  const [error, setError] = useState("");


  useEffect(() => {
    loadGame();
  }, [selectedDate]);


  async function loadGame() {
    try {
      setLoading(true);
      setError("");

      const data = selectedDate
        ? await getGameByDate(selectedDate)
        : await getTodayGame();

      setGame(data);

    } catch (error) {
      console.error(error);

      setError(
        error.message ||
        "Unable to load the game."
      );

    } finally {
      setLoading(false);
    }
  }


  async function handleGuess(event) {
    event.preventDefault();

    const trimmedGuess = guess.trim();

    if (
      !trimmedGuess ||
      submitting ||
      !game
    ) {
      return;
    }


    try {
      setSubmitting(true);
      setError("");

      const result = await submitGuess(
        game.game_session_id,
        trimmedGuess
      );


      console.log(
        "GUESS RESULT:",
        result
      );


      setGame((previous) => ({
        ...previous,

        ...result,

        chunk_number:
          result.next_chunk_number ??
          previous.chunk_number,

        audio_url:
          result.next_audio_url ??
          previous.audio_url,

        revealed_clips:
          result.revealed_clips ??
          previous.revealed_clips,

        total_score:
          result.total_score ??
          previous.total_score ??
          previous.score ??
          0,

        answer:
          result.answer ??
          previous.answer,
      }));


      setGuess("");

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to submit your guess."
      );

    } finally {
      setSubmitting(false);
    }
  }


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] w-full items-center justify-center px-6 py-20">

        <div className="flex flex-col items-center gap-4 text-center">

          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-[#8b5cf6] border-r-[#3b82f6]" />

          <p className="text-sm text-[#a4a4b2]">
            {selectedDate
              ? "Loading historical game..."
              : "Loading today's game..."}
          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     ERROR
     ========================================================= */

  if (error && !game) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1100px] items-center justify-center px-6 py-20 max-[700px]:px-4">

        <div className="w-full max-w-[600px] rounded-[20px] border border-white/[0.09] bg-white/[0.045] p-8 text-center shadow-[0_25px_70px_rgba(0,0,0,0.25)]">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[16px] bg-red-500/10 text-2xl">
            ⚠️
          </div>

          <h2 className="mb-2 font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.03em] text-white">
            Something went wrong
          </h2>

          <p className="mb-6 text-sm leading-6 text-[#a4a4b2]">
            {error}
          </p>

          <button
            onClick={loadGame}
            className="rounded-[13px] border-0 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  if (!game) {
    return null;
  }


  /* =========================================================
     GAME STATE
     ========================================================= */

  const attemptsUsed =
    game.attempts_used ?? 0;


  const attemptsRemaining =
    Math.max(
      0,
      5 - attemptsUsed
    );


  const status =
    game.status ?? "PLAYING";


  const isFinished =
    status === "WON" ||
    status === "LOST";


  const nextScore =
    SCORE_BY_ATTEMPT[
      attemptsUsed + 1
    ] ?? 0;


  const totalScore =
    game.total_score ??
    game.score ??
    0;


  const gameDate =
    game.game_date ??
    getCurrentDate();


  const isTimeMachine =
    game.is_time_machine ??
    Boolean(selectedDate);


  const revealedClips =
    game.revealed_clips ??
    (
      game.audio_url
        ? [
            {
              chunk_number:
                game.chunk_number ?? 1,
              audio_url:
                game.audio_url,
            },
          ]
        : []
    );


  return (
    <div className="w-full">

      <div className="mx-auto w-full max-w-[1100px] px-6 pb-[100px] pt-20 max-[700px]:px-4 max-[700px]:pb-[70px] max-[700px]:pt-12">

        <div className="mx-auto w-full max-w-[720px]">


          {/* =================================================
              HEADER
              ================================================= */}

          <div className="mb-10 flex items-start justify-between gap-7 max-[700px]:flex-col max-[700px]:gap-5">

            <div>

              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#a78bfa]">
                {isTimeMachine
                  ? `Time Machine · ${gameDate}`
                  : "Today's Game"}
              </p>


              <h1 className="m-0 bg-gradient-to-r from-white via-[#b7a6ff] to-[#75a7ff] bg-clip-text font-['Space_Grotesk'] text-[clamp(34px,5vw,52px)] font-bold leading-[1.05] tracking-[-0.055em] text-transparent">
                GuessTheSong
              </h1>

            </div>


            {/* ATTEMPT COUNTER */}

            <div className="min-w-[105px] rounded-[16px] border border-[#8b5cf638] bg-gradient-to-br from-[#8b5cf621] to-[#3b82f614] px-[18px] py-[14px] text-center shadow-[0_15px_45px_rgba(0,0,0,0.22)] max-[700px]:flex max-[700px]:min-w-0 max-[700px]:items-baseline max-[700px]:gap-2 max-[700px]:px-4 max-[700px]:py-2.5">

              <strong className="block font-['Space_Grotesk'] text-[28px] font-bold text-white max-[700px]:text-[22px]">
                {attemptsRemaining}
              </strong>

              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#696977]">
                Attempts
              </span>

            </div>

          </div>



          {/* =================================================
              TIME MACHINE BANNER
              ================================================= */}

          {isTimeMachine && (
            <div className="mb-7 flex items-start gap-4 rounded-[16px] border border-[#8b5cf638] bg-gradient-to-r from-[#8b5cf612] to-[#3b82f608] px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] text-lg shadow-[0_8px_25px_rgba(99,102,241,0.25)]">
                🕘
              </div>

              <div>

                <strong className="block font-['Space_Grotesk'] text-sm font-bold text-white">
                  Time Machine
                </strong>

                <span className="mt-1 block text-xs leading-5 text-[#a4a4b2]">
                  You are replaying the game from{" "}
                  <strong className="text-[#c4b5fd]">
                    {gameDate}
                  </strong>
                  . This game does not affect
                  your statistics or streak.
                </span>

              </div>

            </div>
          )}



          {/* =================================================
              RESULT
              ================================================= */}

          {isFinished && (
            <div
              className={`
                relative mb-11 overflow-hidden rounded-[24px]
                border border-white/[0.09]
                px-[30px] py-[42px]
                text-center
                shadow-[0_25px_70px_rgba(0,0,0,0.25)]
                ${
                  status === "WON"
                    ? "bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.12),transparent_55%),rgba(255,255,255,0.035)]"
                    : "bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.10),transparent_55%),rgba(255,255,255,0.035)]"
                }
              `}
            >

              {/* TOP GLOW */}

              <div
                className={`
                  absolute left-1/4 right-1/4 top-0 h-[2px]
                  bg-gradient-to-r from-transparent
                  ${
                    status === "WON"
                      ? "via-[#22c55e]"
                      : "via-[#ef4444]"
                  }
                  to-transparent
                `}
              />


              {status === "WON" ? (
                <>

                  <div className="mx-auto mb-[18px] flex h-[62px] w-[62px] items-center justify-center rounded-[20px] bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] text-[25px] shadow-[0_15px_35px_rgba(99,102,241,0.25)]">
                    ✨
                  </div>


                  <h2 className="m-0 mb-2 font-['Space_Grotesk'] text-[28px] font-bold tracking-[-0.03em] text-[#86efac]">
                    🎬 Correct Answer!
                  </h2>


                  <p className="mb-6 text-sm text-[#a4a4b2]">
                    {isTimeMachine
                      ? `You guessed the movie from ${gameDate}!`
                      : "You guessed today's movie!"}
                  </p>


                  <div className="mx-auto mb-6 max-w-[420px] rounded-[16px] border border-white/[0.09] bg-black/20 p-5">

                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#696977]">
                      Movie
                    </span>

                    <h3 className="m-0 font-['Space_Grotesk'] text-2xl font-bold text-white">
                      {game.answer}
                    </h3>

                  </div>


                  <ResultStats
                    attemptsUsed={attemptsUsed}
                    totalScore={totalScore}
                    gameDate={gameDate}
                  />

                </>
              ) : (
                <>

                  <div className="mx-auto mb-[18px] flex h-[62px] w-[62px] items-center justify-center rounded-[20px] bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] text-[25px] shadow-[0_15px_35px_rgba(99,102,241,0.25)]">
                    🎬
                  </div>


                  <h2 className="m-0 mb-2 font-['Space_Grotesk'] text-[28px] font-bold tracking-[-0.03em] text-[#fca5a5]">
                    Game Over
                  </h2>


                  <p className="mb-6 text-sm text-[#a4a4b2]">
                    Better luck next time!
                  </p>


                  <div className="mx-auto mb-6 max-w-[420px] rounded-[16px] border border-white/[0.09] bg-black/20 p-5">

                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#696977]">
                      Correct Movie
                    </span>

                    <h3 className="m-0 font-['Space_Grotesk'] text-2xl font-bold text-white">
                      {game.answer}
                    </h3>

                  </div>


                  <ResultStats
                    attemptsUsed={attemptsUsed}
                    totalScore={totalScore}
                    gameDate={gameDate}
                  />

                </>
              )}

            </div>
          )}



          {/* =================================================
              AUDIO CLUES
              ================================================= */}

          {revealedClips.length > 0 && (
            <section className="mt-12">

              <div className="mb-4 flex items-center gap-2.5">

                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] text-sm shadow-[0_8px_25px_rgba(99,102,241,0.25)]">
                  🎧
                </span>

                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#a4a4b2]">
                  Audio Clues
                </span>

              </div>


              <div className="flex flex-col gap-2.5">

                {revealedClips.map((clip) => (

                  <div
                    key={clip.chunk_number}
                    className="flex items-center gap-[15px] rounded-[15px] border border-white/[0.09] bg-white/[0.035] p-[14px] transition duration-200 hover:-translate-y-px hover:border-white/[0.15] hover:bg-white/[0.055] max-[480px]:items-start max-[480px]:gap-2.5 max-[480px]:p-2.5"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#8b5cf640] bg-gradient-to-br from-[#8b5cf64d] to-[#3b82f638] text-[13px] font-bold text-white max-[480px]:h-[35px] max-[480px]:w-[35px]">
                      {clip.chunk_number}
                    </div>


                    <div className="flex min-w-0 flex-1 flex-col gap-2">

                      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a4a4b2]">
                        Audio Clue {clip.chunk_number}
                      </div>


                      <audio
                        controls
                        preload="metadata"
                        src={clip.audio_url}
                        className="block h-[38px] w-full"
                        onError={(event) => {
                          console.error(
                            "Audio failed to load:",
                            clip.audio_url,
                            event.currentTarget.error
                          );
                        }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </section>
          )}



          {/* =================================================
              GUESS FORM
              ================================================= */}

          {!isFinished && (
            <>

              <div className="my-[26px] text-center text-[13px] text-[#696977]">
                Correct answer earns{" "}
                <strong className="text-[#a4a4b2]">
                  {nextScore} points
                </strong>
              </div>


              <form
                onSubmit={handleGuess}
                className="mt-5 flex gap-2.5 max-[700px]:flex-col"
              >

                <input
                  type="text"
                  value={guess}
                  onChange={(event) =>
                    setGuess(event.target.value)
                  }
                  placeholder="Enter the movie name..."
                  disabled={submitting}
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-[14px] border border-white/[0.15] bg-white/[0.045] px-[19px] py-[17px] text-white outline-none transition duration-200 placeholder:text-[#696977] hover:bg-white/[0.06] focus:border-[#8b5cf6] focus:bg-white/[0.065] focus:ring-4 focus:ring-[#8b5cf61a] max-[700px]:min-h-[53px]"
                />


                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !guess.trim()
                  }
                  className="rounded-[14px] border-0 bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] px-[25px] font-bold text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_15px_40px_rgba(99,102,241,0.34)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none max-[700px]:min-h-[53px]"
                >
                  {submitting
                    ? "Checking..."
                    : "Guess"}
                </button>

              </form>

            </>
          )}



          {/* =================================================
              ERROR
              ================================================= */}

          {error && (
            <p className="mt-[18px] rounded-[12px] border border-red-400/15 bg-red-400/[0.07] px-[15px] py-[13px] text-[13px] text-red-300">
              {error}
            </p>
          )}



          {/* =================================================
              PROGRESS
              ================================================= */}

          {!isFinished && (
            <div className="mt-8 flex justify-center gap-[9px]">

              {[1, 2, 3, 4, 5].map(
                (attempt) => (

                  <div
                    key={attempt}
                    className={`
                      h-2 w-2 rounded-full border
                      transition duration-200
                      ${
                        attempt <= attemptsUsed
                          ? "scale-[1.15] border-[#8b5cf6] bg-[#8b5cf6] shadow-[0_0_12px_rgba(139,92,246,0.75)]"
                          : "border-white/[0.12] bg-white/[0.10]"
                      }
                    `}
                  />

                )
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   RESULT STATS
   ========================================================= */

function ResultStats({
  attemptsUsed,
  totalScore,
  gameDate,
}) {
  return (
    <div className="mx-auto grid max-w-[480px] grid-cols-3 border-y border-white/[0.09] max-[480px]:grid-cols-1">

      <div className="border-r border-white/[0.09] px-2 py-[15px] max-[480px]:border-r-0 max-[480px]:border-b">
        <strong className="mb-1 block font-['Space_Grotesk'] text-lg text-white">
          {attemptsUsed}/5
        </strong>

        <span className="block text-[9px] font-bold uppercase tracking-[0.08em] text-[#696977]">
          Guesses
        </span>
      </div>


      <div className="border-r border-white/[0.09] px-2 py-[15px] max-[480px]:border-r-0 max-[480px]:border-b">
        <strong className="mb-1 block font-['Space_Grotesk'] text-lg text-white">
          {totalScore}
        </strong>

        <span className="block text-[9px] font-bold uppercase tracking-[0.08em] text-[#696977]">
          Score
        </span>
      </div>


      <div className="px-2 py-[15px]">
        <strong className="mb-1 block font-['Space_Grotesk'] text-lg text-white">
          {gameDate}
        </strong>

        <span className="block text-[9px] font-bold uppercase tracking-[0.08em] text-[#696977]">
          Date
        </span>
      </div>

    </div>
  );
}


export default Game;