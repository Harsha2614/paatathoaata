import React, { useEffect, useState } from "react";
import { getTodayGame, submitGuess } from "../api";

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

function Game() {
  const [game, setGame] = useState(null);
  const [guess, setGuess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGame();
  }, []);

  async function loadGame() {
    try {
      setLoading(true);
      setError("");

      const data = await getTodayGame();

      console.log("TODAY GAME:", data);

      setGame(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGuess(event) {
    event.preventDefault();

    const trimmedGuess = guess.trim();

    if (!trimmedGuess || submitting || !game) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const result = await submitGuess(
        game.game_session_id,
        trimmedGuess
      );

      console.log("GUESS RESULT:", result);

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

        /*
         * Keep the total score in the game state.
         */
        total_score:
          result.total_score ??
          previous.total_score ??
          previous.score ??
          0,

        /*
         * Keep the answer after the game is finished.
         */
        answer:
          result.answer ??
          previous.answer,
      }));

      setGuess("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="game-page">
        <div className="game-card">
          <p>Loading today's game...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (error && !game) {
    return (
      <div className="game-page">
        <div className="game-card">
          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button onClick={loadGame}>
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

  const attemptsUsed = game.attempts_used ?? 0;

  const attemptsRemaining = Math.max(
    0,
    5 - attemptsUsed
  );

  const status = game.status ?? "PLAYING";

  const isFinished =
    status === "WON" ||
    status === "LOST";

  const nextScore =
    SCORE_BY_ATTEMPT[attemptsUsed + 1] ?? 0;

  /*
   * Score returned by the guess endpoint is total_score.
   * Fall back to score for compatibility.
   */
  const totalScore =
    game.total_score ??
    game.score ??
    0;

  /*
   * The backend currently doesn't send game_date.
   * Use the current date in IST.
   */
  const gameDate = getCurrentDate();

  /*
   * All revealed clips remain available.
   */
  const revealedClips =
    game.revealed_clips ??
    (game.audio_url
      ? [
          {
            chunk_number:
              game.chunk_number ?? 1,
            audio_url: game.audio_url,
          },
        ]
      : []);

  return (
    <div className="game-page">
      <div className="game-card">

        {/* =====================================================
            HEADER
            ===================================================== */}

        <div className="game-header">

          <div>
            <p className="eyebrow">
              Today's Game
            </p>

            <h1>GuessTheSong</h1>
          </div>

          <div className="attempt-counter">
            <strong>
              {attemptsRemaining}
            </strong>

            <span>
              Attempts
            </span>
          </div>

        </div>


        {/* =====================================================
            RESULT
            ===================================================== */}

        {isFinished && (
          <div
            className={
              status === "WON"
                ? "game-result success"
                : "game-result failure"
            }
          >

            {status === "WON" ? (
              <>
                <div className="result-icon">
                  ✨
                </div>

                <h2>
                  🎬 Correct Answer!
                </h2>

                <p>
                  You guessed today's movie!
                </p>

                <div className="result-answer">
                  <span>
                    Movie
                  </span>

                  <h3>
                    {game.answer}
                  </h3>
                </div>

                <div className="result-stats">

                  <div>
                    <strong>
                      {attemptsUsed}/5
                    </strong>

                    <span>
                      GUESSES
                    </span>
                  </div>

                  <div>
                    <strong>
                      {totalScore}
                    </strong>

                    <span>
                      SCORE
                    </span>
                  </div>

                  <div>
                    <strong>
                      {gameDate}
                    </strong>

                    <span>
                      DATE
                    </span>
                  </div>

                </div>
              </>
            ) : (
              <>
                <div className="result-icon">
                  🎬
                </div>

                <h2>
                  Game Over
                </h2>

                <p>
                  Better luck next time!
                </p>

                <div className="result-answer">
                  <span>
                    Correct Movie
                  </span>

                  <h3>
                    {game.answer}
                  </h3>
                </div>

                <div className="result-stats">

                  <div>
                    <strong>
                      {attemptsUsed}/5
                    </strong>

                    <span>
                      GUESSES
                    </span>
                  </div>

                  <div>
                    <strong>
                      {totalScore}
                    </strong>

                    <span>
                      SCORE
                    </span>
                  </div>

                  <div>
                    <strong>
                      {gameDate}
                    </strong>

                    <span>
                      DATE
                    </span>
                  </div>

                </div>
              </>
            )}

          </div>
        )}


        {/* =====================================================
            AUDIO CLUES
            ===================================================== */}

        {revealedClips.length > 0 && (
          <section className="clues-section">

            <div className="clues-header">
              <span>
                🎧
              </span>

              <span>
                Audio Clues
              </span>
            </div>

            {revealedClips.map((clip) => (
              <div
                className="audio-clue"
                key={clip.chunk_number}
              >

                <div className="audio-clue-number">
                  {clip.chunk_number}
                </div>

                <div className="audio-clue-content">

                  <div className="audio-clue-title">
                    Audio Clue {clip.chunk_number}
                  </div>

                  <audio
                    controls
                    preload="metadata"
                    src={clip.audio_url}
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

          </section>
        )}


        {/* =====================================================
            GUESS FORM
            ===================================================== */}

        {!isFinished && (
          <>
            <div className="score-hint">
              Correct answer earns{" "}
              <strong>
                {nextScore} points
              </strong>
            </div>

            <form
              onSubmit={handleGuess}
              className="guess-form"
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
              />

              <button
                type="submit"
                disabled={
                  submitting ||
                  !guess.trim()
                }
              >
                {submitting
                  ? "Checking..."
                  : "Guess"}
              </button>

            </form>
          </>
        )}


        {/* =====================================================
            ERROR
            ===================================================== */}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}


        {/* =====================================================
            PROGRESS
            ===================================================== */}

        {!isFinished && (
          <div className="progress">

            {[1, 2, 3, 4, 5].map(
              (attempt) => (
                <div
                  key={attempt}
                  className={
                    attempt <= attemptsUsed
                      ? "progress-dot used"
                      : "progress-dot"
                  }
                />
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default Game;