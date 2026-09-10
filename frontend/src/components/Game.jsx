import React, { useEffect, useState } from "react";

import {
  getTodayGame,
  getGameByDate,
  submitGuess,
} from "../api";

import {
  BarChart3,
  Clock3,
  CircleHelp,
  Clapperboard,
  Headphones,
  Play,
  Pause,
  Search,
  X,
  Check,
  CircleX,
  Target,
  Share2,
  Link as LinkIcon,
  Sparkles,
  Volume2,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

import {
  FaXTwitter,
  FaWhatsapp,
  FaFacebookF,
} from "react-icons/fa6";


const MAX_GUESSES = 5;

const SCORE_BY_ATTEMPT = {
  1: 100,
  2: 80,
  3: 60,
  4: 40,
  5: 20,
};


/* =========================================================
   DATE HELPERS
========================================================= */

function getTodayIST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}


function formatDate(dateString) {
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


function formatShortDate(dateString) {
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
  });
}


/* =========================================================
   COUNTDOWN
========================================================= */

function getCountdown() {
  const now = new Date();

  const tomorrow = new Date();

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  tomorrow.setHours(
    0,
    0,
    0,
    0
  );

  const difference =
    tomorrow.getTime() -
    now.getTime();

  if (difference <= 0) {
    return {
      hours: "00",
      minutes: "00",
      seconds: "00",
    };
  }

  const totalSeconds =
    Math.floor(difference / 1000);

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}


/* =========================================================
   MAIN GAME
========================================================= */

function Game({ selectedDate }) {
  const [game, setGame] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [guess, setGuess] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [countdown, setCountdown] =
    useState(getCountdown());

  /*
   * NEW:
   * Stores every movie guess made by the player.
   */
  const [guesses, setGuesses] =
    useState([]);


  /* =========================================================
     LOAD GAME
  ========================================================= */

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

      /*
       * If the backend later returns attempts,
       * restore them automatically.
       *
       * For now this safely falls back to [].
       */
      setGuesses(data.attempts ?? []);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to load today's game."
      );

    } finally {
      setLoading(false);
    }
  }


  /* =========================================================
     COUNTDOWN
  ========================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  /* =========================================================
     SUBMIT GUESS
  ========================================================= */

  async function handleGuess(event) {
    event.preventDefault();

    const trimmedGuess =
      guess.trim();

    if (
      !trimmedGuess ||
      submitting ||
      !game ||
      game.status !== "PLAYING"
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const result =
        await submitGuess(
          game.game_session_id,
          trimmedGuess
        );


      /* =====================================================
         SAVE THE GUESS
      ===================================================== */

      setGuesses((previous) => [
        ...previous,

        {
          attempt_number:
            previous.length + 1,

          guess:
            trimmedGuess,

          is_correct:
            result.correct === true,

          score_earned:
            result.score_earned ?? 0,

          skipped: false,
        },
      ]);


      /* =====================================================
         UPDATE GAME
      ===================================================== */

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
     SKIP CURRENT CLUE
  ========================================================= */

  async function handleSkip() {
    if (
      submitting ||
      !game ||
      game.status !== "PLAYING" ||
      attemptsUsed >= MAX_GUESSES
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      /*
       * SKIP uses the existing guess endpoint.
       *
       * The backend treats this as an incorrect attempt,
       * so one attempt is consumed and the next clue is
       * revealed. No score is earned.
       */
      const result =
        await submitGuess(
          game.game_session_id,
          "__SKIPPED__"
        );


      /* =====================================================
         SAVE THE SKIP
      ===================================================== */

      setGuesses((previous) => [
        ...previous,

        {
          attempt_number:
            previous.length + 1,

          guess:
            "__SKIPPED__",

          is_correct: false,

          score_earned: 0,

          skipped: true,
        },
      ]);


      /* =====================================================
         UPDATE GAME
      ===================================================== */

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
        "Unable to skip the clue."
      );

    } finally {
      setSubmitting(false);
    }
  }


  /* =========================================================
     LOADING
  =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-62px)] items-center justify-center bg-[#080808]">

        <div className="text-center">

          <div className="mb-4 flex justify-center">
            <Clapperboard
              size={36}
              strokeWidth={1.5}
              className="text-[#e4a32d]"
            />
          </div>

          <h1 className="font-['Georgia'] text-[28px] font-bold text-[#e4a32d]">
            ABSOLUTE CINEMA
          </h1>

          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[#68645f]">
            Loading today's movie...
          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     ERROR / NO GAME
  ========================================================= */

  if (!game) {
    return (
      <div className="flex min-h-[calc(100vh-62px)] items-center justify-center bg-[#080808] px-5">

        <div className="rounded-[15px] border border-[#503d21] bg-[#151515] p-8 text-center">

          <div className="mb-4 flex justify-center">
            <AlertCircle
              size={34}
              strokeWidth={1.5}
              className="text-[#e4a32d]"
            />
          </div>

          <h2 className="font-['Georgia'] text-[24px] font-bold text-[#e4a32d]">
            Unable to Load Game
          </h2>

          <p className="mt-3 text-[13px] text-[#77736d]">
            {error || "Something went wrong."}
          </p>

          <button
            onClick={loadGame}
            className="mt-5 inline-flex items-center gap-2 rounded-[9px] border border-[#91661d] bg-[#d89b2e] px-6 py-3 text-[12px] font-bold text-[#171109] transition hover:brightness-110"
          >
            <RotateCcw
              size={14}
              strokeWidth={2}
            />

            TRY AGAIN
          </button>

        </div>

      </div>
    );
  }


  /* =========================================================
     GAME VALUES
  ========================================================= */

  const attemptsUsed =
    game.attempts_used ?? 0;

  const attemptsRemaining =
    Math.max(
      0,
      MAX_GUESSES - attemptsUsed
    );

  const status =
    game.status ?? "PLAYING";

  const isFinished =
    status === "WON" ||
    status === "LOST";

  const isWon =
    status === "WON";

  const isTimeMachine =
    game.is_time_machine ??
    Boolean(selectedDate);

  const totalScore =
    game.total_score ?? 0;

  const gameDate =
    game.game_date ??
    selectedDate ??
    getTodayIST();

  const formattedDate =
    formatDate(gameDate);

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
    <div className="min-h-[calc(100vh-62px)] w-full bg-[#080808]">

      <div className="mx-auto w-full max-w-[1000px] px-5 pb-24 pt-8 max-[700px]:px-4">


        {/* =================================================
            HERO
        ================================================= */}

        <section className="text-center">

          <div className="flex items-center justify-center gap-2">

            <Clapperboard
              size={14}
              strokeWidth={1.6}
              className="text-[#d99a22]"
            />

            <span className="text-[10px] uppercase tracking-[0.24em] text-[#6f6a64]">
              Daily Movie Guessing Game
            </span>

          </div>


          <h1 className="mt-2 font-['Georgia'] text-[54px] font-bold leading-none tracking-[-0.045em] text-[#e5a32d] max-[700px]:text-[39px]">
            ABSOLUTE CINEMA
          </h1>


          <div className="mt-5 inline-flex rounded-full border border-[#684916] bg-[#1c160c] px-4 py-2">

            <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#d9a139]">

              {isTimeMachine
                ? `TIME MACHINE · ${formattedDate}`
                : `TODAY'S MOVIE · ${formattedDate}`}

            </span>

          </div>

        </section>


        {/* =================================================
            QUICK NAV CARDS
        ================================================= */}

        {!isFinished && (
          <div className="mx-auto mt-7 grid max-w-[594px] grid-cols-3 gap-3 max-[650px]:grid-cols-1">

            <QuickNav
              icon={
                <BarChart3
                  size={22}
                  strokeWidth={1.7}
                />
              }
              title="STATS"
            />

            <QuickNav
              icon={
                <Clock3
                  size={22}
                  strokeWidth={1.7}
                />
              }
              title="TIME MACHINE"
            />

            <QuickNav
              icon={
                <CircleHelp
                  size={22}
                  strokeWidth={1.7}
                />
              }
              title="HOW TO PLAY"
            />

          </div>
        )}


        {/* =================================================
            RESULT / PLAYING
        ================================================= */}

        {isFinished ? (

          <CompletedGame
            game={game}
            attemptsUsed={attemptsUsed}
            totalScore={totalScore}
            isWon={isWon}
            isTimeMachine={isTimeMachine}
            formattedDate={formattedDate}
            revealedClips={revealedClips}
            countdown={countdown}
            guesses={guesses}
          />

        ) : (

          <PlayingGame
            game={game}
            attemptsUsed={attemptsUsed}
            attemptsRemaining={attemptsRemaining}
            revealedClips={revealedClips}
            guess={guess}
            setGuess={setGuess}
            submitting={submitting}
            handleGuess={handleGuess}
            handleSkip={handleSkip}
            error={error}
            guesses={guesses}
          />

        )}

      </div>

    </div>
  );
}


/* =========================================================
   QUICK NAV
========================================================= */

function QuickNav({
  icon,
  title,
}) {
  return (
    <div className="flex h-[74px] flex-col items-center justify-center rounded-[15px] border border-[#463721] bg-[#151515] transition hover:border-[#70511d] hover:bg-[#191816]">

      <span className="text-[#dca02d]">
        {icon}
      </span>

      <span className="mt-2 text-[10px] font-bold text-[#e2ddd5]">
        {title}
      </span>

    </div>
  );
}


/* =========================================================
   PLAYING GAME
========================================================= */

function PlayingGame({
  game,
  attemptsUsed,
  attemptsRemaining,
  revealedClips,
  guess,
  setGuess,
  submitting,
  handleGuess,
  handleSkip,
  error,
  guesses,
}) {
  return (
    <div className="mx-auto mt-7 max-w-[594px]">


      {/* =================================================
          GUESS PROGRESS
      ================================================= */}

      <div className="flex items-center justify-between rounded-[15px] border border-[#463721] bg-[#151515] px-5 py-3.5">

        <div className="flex gap-2">

          {[1, 2, 3, 4, 5].map(
            (number) => {

              const submittedGuess =
                guesses[number - 1];

              const isWrong =
                submittedGuess &&
                submittedGuess.is_correct === false;

              const isCorrect =
                submittedGuess &&
                submittedGuess.is_correct === true;


              return (
                <div
                  key={number}
                  className={`
                    flex
                    h-[24px]
                    w-[24px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    transition-all
                    duration-200

                    ${
                      isWrong
                        ? "border-[#a5253c] bg-[#c52845] text-white shadow-[0_0_12px_rgba(197,40,69,0.18)]"

                        : isCorrect
                        ? "border-[#d89b2d] bg-[#d89b2d] text-[#171109] shadow-[0_0_12px_rgba(216,155,45,0.16)]"

                        : "border-[#454545] bg-[#292929]"
                    }
                  `}
                >

                  {isWrong && (
                    <CircleX
                      size={14}
                      strokeWidth={2.3}
                    />
                  )}

                  {isCorrect && (
                    <Check
                      size={14}
                      strokeWidth={2.6}
                    />
                  )}

                </div>
              );
            }
          )}

        </div>


        <div className="font-['Georgia'] text-[19px] font-bold text-[#e5a32d]">

          {attemptsRemaining}

          <span className="ml-1 text-[11px] uppercase tracking-[0.05em]">
            Guesses Remaining
          </span>

        </div>

      </div>


      {/* =================================================
          INSTRUCTION
      ================================================= */}

      <div className="my-5 flex items-center justify-center gap-2">

        <Headphones
          size={14}
          strokeWidth={1.7}
          className="text-[#b6afa5]"
        />

        <p className="m-0 text-center text-[12px] text-[#aaa39a]">
          Listen to the clip — each wrong guess unlocks an easier one
        </p>

      </div>


      {/* =================================================
          CURRENT CLUE
      ================================================= */}

      <div className="rounded-[15px] border border-[#493821] bg-[#171717] p-4">

        <AudioRow
          clip={
            revealedClips[
              revealedClips.length - 1
            ]
          }
          index={
            revealedClips.length
          }
        />

      </div>


      {/* =================================================
          QUESTION
      ================================================= */}

      <div className="mt-4 text-center">

        <h2 className="font-['Georgia'] text-[15px] font-bold text-[#e6a62f]">
          What movie is this from?
        </h2>

      </div>


      {/* =================================================
          GUESS FORM
      ================================================= */}

      <form
        onSubmit={handleGuess}
        className="mt-5"
      >

        <div className="relative">

          <Search
            size={20}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d29a24]"
          />


          <input
            type="text"
            value={guess}
            onChange={(event) =>
              setGuess(event.target.value)
            }
            placeholder="Search for a movie..."
            disabled={submitting}
            autoComplete="off"
            className="h-[62px] w-full rounded-[13px] border border-[#755316] bg-[#0e0e0e] pl-12 pr-12 text-[16px] text-[#eee8df] outline-none transition placeholder:text-[#67625c] focus:border-[#c58b21] focus:ring-1 focus:ring-[#c58b21]/30"
          />


          {guess && (
            <button
              type="button"
              onClick={() => setGuess("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center border-0 bg-transparent text-[#6e6a64] transition hover:text-[#d7d0c5]"
            >
              <X
                size={19}
                strokeWidth={1.8}
              />
            </button>
          )}

        </div>


        <div className="mt-3 flex gap-3">

          <button
            type="submit"
            disabled={
              submitting ||
              !guess.trim()
            }
            className="h-[55px] flex-1 rounded-[12px] border border-[#a8751e] bg-gradient-to-b from-[#e5ad3e] to-[#bd831f] text-[14px] font-bold uppercase tracking-[0.08em] text-[#151008] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35"
          >

            {submitting
              ? "CHECKING..."
              : "GUESS"}

          </button>


          <button
            type="button"
            onClick={handleSkip}
            disabled={
              submitting ||
              attemptsRemaining <= 0
            }
            aria-label="Skip current audio clue"
            className="h-[55px] w-[82px] rounded-[12px] border border-[#795719] bg-transparent text-[13px] font-bold uppercase text-[#e3a52e] transition hover:bg-[#1d170d] disabled:cursor-not-allowed disabled:opacity-35"
          >
            {submitting
              ? "..."
              : "SKIP"}
          </button>

        </div>


        {guess && (
          <p className="mt-3 text-center text-[10px] text-[#6f6961]">

            Selected:{" "}

            <span className="text-[#e0a32d]">
              {guess}
            </span>

          </p>
        )}

      </form>


      {/* =================================================
          NEW — PREVIOUS GUESSES
      ================================================= */}

      {guesses.length > 0 && (
        <section className="mt-5">

          <div className="mb-3 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <Target
                size={13}
                strokeWidth={1.8}
                className="text-[#b68a31]"
              />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#77716a]">
                Your Guesses
              </span>

            </div>

            <span className="text-[10px] uppercase tracking-[0.08em] text-[#4f4b46]">
              {guesses.length}/{MAX_GUESSES}
            </span>

          </div>


          <div className="flex flex-col gap-2">

            {guesses.map(
              (item, index) => {

                const isCorrect =
                  item.is_correct === true;

                const attemptNumber =
                  item.attempt_number ??
                  index + 1;


                return (
                  <div
                    key={`${attemptNumber}-${item.guess}`}
                    className={`
                      flex
                      min-h-[44px]
                      items-center
                      gap-3
                      rounded-[11px]
                      border
                      px-3.5
                      transition-all

                      ${
                        isCorrect
                          ? "border-[#6d5525] bg-[#18140c]"
                          : "border-[#292725] bg-[#101010]"
                      }
                    `}
                  >

                    {/* STATUS */}

                    <div
                      className={`
                        flex
                        h-[19px]
                        w-[19px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-full

                        ${
                          isCorrect
                            ? "bg-[#d89b2d] text-[#171109]"
                            : "bg-[#c52845] text-white"
                        }
                      `}
                    >

                      {isCorrect ? (
                        <Check
                          size={11}
                          strokeWidth={2.7}
                        />
                      ) : (
                        <CircleX
                          size={12}
                          strokeWidth={2.3}
                        />
                      )}

                    </div>


                    {/* NUMBER */}

                    <span className="w-[18px] shrink-0 text-[10px] font-bold text-[#55514b]">
                      {attemptNumber}
                    </span>


                    {/* GUESS */}

                    <span
                      className={`
                        min-w-0 flex-1 truncate text-[13px] font-medium

                        ${
                          isCorrect
                            ? "text-[#e6c879]"
                            : item.skipped
                            ? "italic text-[#6f6a63]"
                            : "text-[#aaa59d]"
                        }
                      `}
                    >
                      {item.skipped
                        ? "Skipped"
                        : item.guess}
                    </span>


                    {/* SCORE */}

                    {isCorrect && (
                      <span className="shrink-0 text-[10px] font-bold text-[#dca02d]">
                        +{item.score_earned ?? 0}
                      </span>
                    )}

                  </div>
                );
              }
            )}

          </div>

        </section>
      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-[12px] text-red-300">

          <AlertCircle
            size={14}
            strokeWidth={1.8}
          />

          <span>
            {error}
          </span>

        </div>
      )}

    </div>
  );
}


/* =========================================================
   AUDIO ROW
========================================================= */

function AudioRow({
  clip,
  index,
}) {
  const [audio] =
    useState(() => new Audio());

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);


  const difficulty = [
    "VERY DIFFICULT",
    "SLIGHTLY EASIER",
    "RECOGNIZABLE",
    "FAMOUS SCENE",
    "VERY RECOGNIZABLE",
  ][
    Math.min(
      Math.max(index - 1, 0),
      4
    )
  ];


  /* =====================================================
     AUDIO SETUP
  ===================================================== */

  useEffect(() => {
    if (!clip?.audio_url) {
      return;
    }

    audio.pause();

    audio.src = clip.audio_url;
    audio.preload = "metadata";
    audio.load();

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);


    const handleLoadedMetadata = () => {
      setDuration(
        Number.isFinite(audio.duration)
          ? audio.duration
          : 0
      );
    };


    const handleTimeUpdate = () => {
      setCurrentTime(
        audio.currentTime
      );
    };


    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };


    const handlePlay = () => {
      setIsPlaying(true);
    };


    const handlePause = () => {
      setIsPlaying(false);
    };


    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    audio.addEventListener(
      "ended",
      handleEnded
    );

    audio.addEventListener(
      "play",
      handlePlay
    );

    audio.addEventListener(
      "pause",
      handlePause
    );


    return () => {
      audio.pause();

      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      audio.removeEventListener(
        "ended",
        handleEnded
      );

      audio.removeEventListener(
        "play",
        handlePlay
      );

      audio.removeEventListener(
        "pause",
        handlePause
      );
    };

  }, [clip?.audio_url, audio]);


  /* =====================================================
     PLAY / PAUSE
  ===================================================== */

  function togglePlay() {
    if (!clip?.audio_url) {
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error(
          "Unable to play audio:",
          error
        );
      });
    }
  }


  /* =====================================================
     SEEK
  ===================================================== */

  function handleSeek(event) {
    const value =
      Number(event.target.value);

    audio.currentTime = value;

    setCurrentTime(value);
  }


  /* =====================================================
     TIME FORMAT
  ===================================================== */

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      Math.floor(seconds % 60);

    return `${minutes}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }


  const progress =
    duration > 0
      ? (currentTime / duration) * 100
      : 0;


  return (
    <div className="w-full">


      {/* =================================================
          TOP ROW
      ================================================= */}

      <div className="flex items-center gap-4 max-[550px]:gap-3">


        {/* PLAY BUTTON */}

        <button
          type="button"
          onClick={togglePlay}
          aria-label={
            isPlaying
              ? "Pause audio"
              : "Play audio"
          }
          className="
            group
            relative
            flex
            h-[56px]
            w-[56px]
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-[#e8ad3b]
            bg-gradient-to-br
            from-[#f1bb4d]
            to-[#d99724]
            text-[#171108]
            shadow-[0_8px_24px_rgba(220,155,38,0.18)]
            transition
            duration-200
            hover:scale-105
            hover:shadow-[0_10px_30px_rgba(220,155,38,0.30)]
            active:scale-95
          "
        >

          {isPlaying ? (
            <Pause
              size={21}
              strokeWidth={2}
            />
          ) : (
            <Play
              size={22}
              strokeWidth={1.8}
              className="ml-[2px]"
            />
          )}

        </button>


        {/* AUDIO CONTENT */}

        <div className="min-w-0 flex-1">


          {/* TITLE */}

          <div className="flex items-center justify-between gap-3">

            <span className="text-[12px] font-bold text-[#eee7dc]">
              Audio Clue {clip?.chunk_number}
            </span>

            <span className="shrink-0 text-[8px] font-medium tracking-[0.02em] text-[#6f6a62]">
              {difficulty}
            </span>

          </div>


          {/* CUSTOM PROGRESS */}

          <div className="mt-2 flex items-center gap-2">

            <span className="w-[30px] shrink-0 font-mono text-[9px] text-[#77716a]">
              {formatTime(currentTime)}
            </span>


            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.01"
              value={currentTime}
              onChange={handleSeek}
              aria-label="Audio progress"
              className="audio-slider h-[4px] min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#34322f] accent-[#e2a52f]"
              style={{
                background: `linear-gradient(
                  to right,
                  #e2a52f ${progress}%,
                  #34322f ${progress}%
                )`,
              }}
            />


            <span className="w-[30px] shrink-0 text-right font-mono text-[9px] text-[#77716a]">
              {formatTime(duration)}
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          PLAYING INDICATOR
      ================================================= */}

      {isPlaying && (
        <div className="ml-[72px] mt-2 flex items-center gap-2">

          <Volume2
            size={11}
            strokeWidth={1.7}
            className="text-[#9b752d]"
          />

          <span className="text-[8px] uppercase tracking-[0.16em] text-[#9b752d]">
            Playing
          </span>

          <span className="ml-1 flex items-end gap-[2px]">

            <span className="h-[5px] w-[2px] animate-pulse rounded-full bg-[#dca12c]" />

            <span className="h-[9px] w-[2px] animate-pulse rounded-full bg-[#dca12c] [animation-delay:100ms]" />

            <span className="h-[6px] w-[2px] animate-pulse rounded-full bg-[#dca12c] [animation-delay:200ms]" />

            <span className="h-[11px] w-[2px] animate-pulse rounded-full bg-[#dca12c] [animation-delay:300ms]" />

          </span>

        </div>
      )}

    </div>
  );
}


/* =========================================================
   COMPLETED GAME
========================================================= */

function CompletedGame({
  game,
  attemptsUsed,
  totalScore,
  isWon,
  isTimeMachine,
  formattedDate,
  revealedClips,
  countdown,
  guesses,
}) {
  return (
    <div className="mx-auto mt-7 max-w-[594px]">


      {/* =================================================
          RESULT CARD
      ================================================= */}

      <section className="relative overflow-hidden rounded-[15px] border border-[#63491f] bg-[#171717] px-6 py-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">

        <div className="absolute left-1/4 right-1/4 top-0 h-px bg-gradient-to-r from-transparent via-[#d99a22] to-transparent" />


        <div className="flex justify-center text-[#e5a32d]">
          <Sparkles
            size={29}
            strokeWidth={1.5}
          />
        </div>


        <div className="mt-2 flex items-center justify-center gap-2">

          <Clapperboard
            size={27}
            strokeWidth={1.5}
            className="text-[#e5a32d]"
          />

          <h2 className="font-['Georgia'] text-[30px] font-bold text-[#e5a32d] max-[600px]:text-[25px]">

            {isWon
              ? "ABSOLUTE CINEMA!"
              : "SO CLOSE!"}

          </h2>

        </div>


        <p className="mt-1 text-[13px] text-[#88827a]">

          {isWon
            ? "You guessed today's movie!"
            : "Better luck on the next movie!"}

        </p>


        {/* =================================================
            FIVE GUESS BOXES
        ================================================= */}

        <div className="mt-5 flex justify-center gap-2">

          {[1, 2, 3, 4, 5].map(
            (number) => {

              const item =
                guesses[number - 1];

              const correct =
                item?.is_correct === true;

              const wrong =
                item?.is_correct === false;


              return (
                <div
                  key={number}
                  className={`
                    flex
                    h-[51px]
                    w-[51px]
                    items-center
                    justify-center
                    rounded-[10px]
                    border

                    ${
                      correct
                        ? "border-[#d89b2d] bg-[#d89b2d] text-[#171109]"

                        : wrong
                        ? "border-[#a5253c] bg-[#c52845] text-white"

                        : "border-[#414141] bg-[#242424] text-transparent"
                    }
                  `}
                >

                  {correct && (
                    <Check
                      size={22}
                      strokeWidth={2.5}
                    />
                  )}

                  {wrong && (
                    <CircleX
                      size={22}
                      strokeWidth={2.2}
                    />
                  )}

                </div>
              );
            }
          )}

        </div>


        {/* =================================================
            ANSWER
        ================================================= */}

        <h3 className="mt-5 font-['Georgia'] text-[28px] font-bold uppercase text-[#eee7dc]">
          {game.answer || "Unknown"}
        </h3>


        {game.movie_year && (
          <p className="mt-1 font-['Georgia'] text-[15px] font-bold text-[#dca12c]">
            {game.movie_year}
          </p>
        )}


        {/* =================================================
            THREE STATS
        ================================================= */}

        <div className="mt-6 grid grid-cols-3 gap-2">

          <ResultStat
            value={`${attemptsUsed} / 5`}
            label="GUESSES"
          />

          <ResultStat
            value={totalScore}
            label="SCORE"
          />

          <ResultStat
            value={formatShortDate(game.game_date)}
            label="DATE"
          />

        </div>

      </section>


      {/* =================================================
          GUESSES
      ================================================= */}

      {guesses.length > 0 && (
        <section className="mt-5 rounded-[15px] border border-[#463721] bg-[#151515] p-4">

          <div className="mb-3 flex items-center justify-center gap-2">

            <Target
              size={13}
              strokeWidth={1.7}
              className="text-[#9b752d]"
            />

            <p className="m-0 text-[10px] uppercase tracking-[0.22em] text-[#77716a]">
              Your Guesses
            </p>

          </div>


          <div className="flex flex-col gap-2">

            {guesses.map(
              (item, index) => {

                const isCorrect =
                  item.is_correct === true;

                return (
                  <div
                    key={`${item.attempt_number ?? index}-${item.guess}`}
                    className={`
                      flex
                      min-h-[42px]
                      items-center
                      gap-3
                      rounded-[10px]
                      border
                      px-3.5

                      ${
                        isCorrect
                          ? "border-[#6d5525] bg-[#18140c]"
                          : "border-[#292725] bg-[#101010]"
                      }
                    `}
                  >

                    <div
                      className={`
                        flex
                        h-[18px]
                        w-[18px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-full

                        ${
                          isCorrect
                            ? "bg-[#d89b2d] text-[#171109]"
                            : "bg-[#c52845] text-white"
                        }
                      `}
                    >

                      {isCorrect ? (
                        <Check
                          size={11}
                          strokeWidth={2.6}
                        />
                      ) : (
                        <CircleX
                          size={11}
                          strokeWidth={2.3}
                        />
                      )}

                    </div>


                    <span className="w-[18px] text-[10px] font-bold text-[#55514b]">
                      {item.attempt_number ??
                        index + 1}
                    </span>


                    <span
                      className={`
                        min-w-0 flex-1 truncate text-[12px]

                        ${
                          isCorrect
                            ? "text-[#e6c879]"
                            : item.skipped
                            ? "italic text-[#6f6a63]"
                            : "text-[#aaa59d]"
                        }
                      `}
                    >
                      {item.skipped
                        ? "Skipped"
                        : item.guess}
                    </span>


                    {isCorrect && (
                      <span className="text-[10px] font-bold text-[#dca02d]">
                        +{item.score_earned ?? 0}
                      </span>
                    )}

                  </div>
                );
              }
            )}

          </div>

        </section>
      )}


      {/* =================================================
          ALL CLUES
      ================================================= */}

      <section className="mt-6 rounded-[15px] border border-[#463721] bg-[#151515] p-4">

        <div className="mb-3 flex items-center justify-center gap-2">

          <Headphones
            size={13}
            strokeWidth={1.7}
            className="text-[#9b752d]"
          />

          <p className="m-0 text-[10px] uppercase tracking-[0.22em] text-[#77716a]">
            All Clues · Replay Any Audio
          </p>

        </div>


        <div className="flex flex-col gap-2">

          {revealedClips.map(
            (clip, index) => (

              <div
                key={clip.chunk_number}
                className="rounded-[13px] border border-[#443622] bg-[#191919] p-3.5"
              >

                <AudioRow
                  clip={clip}
                  index={index + 1}
                />

              </div>

            )
          )}

        </div>

      </section>


      {/* =================================================
          SHARE RESULT
      ================================================= */}

      {!isTimeMachine && (
        <ShareResult
          attemptsUsed={attemptsUsed}
          totalScore={totalScore}
        />
      )}


      {/* =================================================
          NEXT MOVIE
      ================================================= */}

      {!isTimeMachine && (
        <section className="mt-5 rounded-[15px] border border-[#463721] bg-[#151515] px-5 py-5 text-center">

          <p className="m-0 text-[10px] uppercase tracking-[0.22em] text-[#77716a]">
            NEXT MOVIE IN
          </p>


          <div className="mt-2 flex items-center justify-center gap-4 font-mono text-[31px] font-bold text-[#e5a32d]">

            <CountdownUnit
              value={countdown.hours}
              label="HRS"
            />

            <span>:</span>

            <CountdownUnit
              value={countdown.minutes}
              label="MINS"
            />

            <span>:</span>

            <CountdownUnit
              value={countdown.seconds}
              label="SECS"
            />

          </div>

        </section>
      )}

    </div>
  );
}


/* =========================================================
   RESULT STAT
========================================================= */

function ResultStat({
  value,
  label,
}) {
  return (
    <div className="rounded-[9px] border border-[#3e321f] bg-[#101010] px-2 py-3">

      <strong className="block font-['Georgia'] text-[18px] font-bold text-[#e8dfd2]">
        {value}
      </strong>

      <span className="mt-1 block text-[8px] uppercase tracking-[0.1em] text-[#66615b]">
        {label}
      </span>

    </div>
  );
}


/* =========================================================
   SHARE RESULT
========================================================= */

function ShareResult({
  attemptsUsed,
  totalScore,
}) {
  const text =
    `Absolute Cinema\n` +
    `${attemptsUsed}/5 guesses · ${totalScore} points\n` +
    `Can you beat me?`;


  async function copyResult() {
    try {
      await navigator.clipboard.writeText(text);

      alert("Result copied!");

    } catch {
      console.error(
        "Unable to copy result."
      );
    }
  }


  async function shareResult() {
    if (navigator.share) {

      try {
        await navigator.share({
          title: "Absolute Cinema",
          text,
        });

      } catch {
        // User cancelled share.
      }

      return;
    }

    copyResult();
  }


  return (
    <section className="mt-5">

      <p className="mb-3 text-center text-[10px] uppercase tracking-[0.22em] text-[#77716a]">
        SHARE RESULT
      </p>


      <div className="grid grid-cols-2 gap-2.5 max-[500px]:grid-cols-1">


        {/* X */}

        <button
          onClick={shareResult}
          className="flex h-[44px] items-center justify-center gap-2 rounded-[10px] border-0 bg-[#f1f1f1] text-[12px] font-bold text-[#171717] transition hover:brightness-95"
        >

          <FaXTwitter size={14} />

          <span>
            X / Twitter
          </span>

        </button>


        {/* WHATSAPP */}

        <button
          onClick={shareResult}
          className="flex h-[44px] items-center justify-center gap-2 rounded-[10px] border-0 bg-[#09a874] text-[12px] font-bold text-white transition hover:brightness-105"
        >

          <FaWhatsapp size={16} />

          <span>
            WhatsApp
          </span>

        </button>


        {/* FACEBOOK */}

        <button
          onClick={shareResult}
          className="flex h-[44px] items-center justify-center gap-2 rounded-[10px] border-0 bg-[#2867df] text-[12px] font-bold text-white transition hover:brightness-105"
        >

          <FaFacebookF size={14} />

          <span>
            Facebook
          </span>

        </button>


        {/* COPY LINK */}

        <button
          onClick={copyResult}
          className="flex h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#946719] bg-[#281c0a] text-[12px] font-bold text-[#e1a42f] transition hover:bg-[#34240d]"
        >

          <LinkIcon
            size={15}
            strokeWidth={1.8}
          />

          <span>
            Copy Link
          </span>

        </button>

      </div>


      {/* SHARE */}

      <button
        onClick={shareResult}
        className="mt-2.5 flex h-[46px] w-full items-center justify-center gap-2 rounded-[10px] border-0 bg-gradient-to-b from-[#e4ac3c] to-[#c28620] text-[12px] font-bold uppercase tracking-[0.05em] text-[#161108] transition hover:brightness-110"
      >

        <Share2
          size={16}
          strokeWidth={1.8}
        />

        <span>
          SHARE RESULT
        </span>

      </button>

    </section>
  );
}


/* =========================================================
   COUNTDOWN UNIT
========================================================= */

function CountdownUnit({
  value,
  label,
}) {
  return (
    <div className="flex flex-col items-center">

      <span>
        {value}
      </span>

      <small className="mt-0.5 text-[8px] font-sans font-normal tracking-[0.14em] text-[#68625b]">
        {label}
      </small>

    </div>
  );
}


export default Game;