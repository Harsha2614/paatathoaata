import React, { useState } from "react";

import {
  uploadSong,
  scheduleDailyGame,
  logout,
} from "../api";


function getTodayIST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}


function AdminDashboard({ user }) {
  const [title, setTitle] = useState("");
  const [movieName, setMovieName] = useState("");
  const [gameDate, setGameDate] = useState("");

  const [chunks, setChunks] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const today = getTodayIST();


  function handleFileChange(chunkNumber, file) {
    setChunks((previous) => ({
      ...previous,
      [chunkNumber]: file,
    }));
  }


  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    // Validate song title
    if (!title.trim()) {
      setError("Please enter the song title.");
      return;
    }

    // Validate movie name
    if (!movieName.trim()) {
      setError("Please enter the movie name.");
      return;
    }

    // Validate game date
    if (!gameDate) {
      setError("Please select a game date.");
      return;
    }

    // Prevent scheduling in the past
    if (gameDate < today) {
      setError("Game date cannot be earlier than today.");
      return;
    }

    // Validate all five chunks
    for (let i = 1; i <= 5; i++) {
      if (!chunks[i]) {
        setError(`Please select audio for Chunk ${i}.`);
        return;
      }
    }

    try {
      setLoading(true);

      // ==========================================
      // STEP 1: CREATE SONG
      // ==========================================

      const result = await uploadSong({
        title: title.trim(),
        movieName: movieName.trim(),
        chunk1: chunks[1],
        chunk2: chunks[2],
        chunk3: chunks[3],
        chunk4: chunks[4],
        chunk5: chunks[5],
      });


      // ==========================================
      // STEP 2: SCHEDULE SONG
      // ==========================================

      await scheduleDailyGame(
        result.id,
        gameDate
      );


      // ==========================================
      // SUCCESS
      // ==========================================

      setMessage(
        `Song "${result.title}" was created and scheduled for ${gameDate}.`
      );

      // Reset form
      setTitle("");
      setMovieName("");
      setGameDate("");

      setChunks({
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
      });


      // Reset file inputs
      document
        .querySelectorAll(".audio-file-input")
        .forEach((input) => {
          input.value = "";
        });

    } catch (error) {
      console.error(error);

      setError(
        error.message ||
        "Unable to create and schedule the game."
      );

    } finally {
      setLoading(false);
    }
  }


  async function handleLogout() {
    try {
      await logout();

      window.location.href = "/";

    } catch (error) {
      console.error(error);
    }
  }


  return (
    <div className="min-h-screen w-full bg-[#08080d] text-white">


      {/* ==========================================
          ADMIN NAVBAR
          ========================================== */}

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#08080d]/90 backdrop-blur-xl">

        <div className="mx-auto flex h-[72px] w-full max-w-[1200px] items-center justify-between px-6 max-[600px]:px-4">

          {/* Logo */}

          <div className="font-['Space_Grotesk'] text-[20px] font-bold tracking-[-0.04em]">
            GuessTheSong

            <span className="ml-2 text-[13px] font-medium tracking-normal text-[#a78bfa]">
              Admin
            </span>
          </div>


          {/* User */}

          <div className="flex items-center gap-4 max-[600px]:gap-2">

            <span className="max-w-[220px] truncate text-[13px] text-[#a4a4b2] max-[600px]:hidden">
              {user.email}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-[10px] border border-white/[0.09] bg-white/[0.045] px-4 py-2.5 text-[13px] font-semibold text-[#d0d0d8] transition duration-200 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white"
            >
              Logout
            </button>

          </div>

        </div>

      </header>


      {/* ==========================================
          ADMIN CONTENT
          ========================================== */}

      <main className="mx-auto w-full max-w-[1000px] px-6 pb-24 pt-14 max-[600px]:px-4 max-[600px]:pt-10">


        {/* ==========================================
            HEADING
            ========================================== */}

        <div className="mb-10">

          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#a78bfa]">
            Content Management
          </p>

          <h1 className="m-0 font-['Space_Grotesk'] text-[46px] font-bold leading-[1.05] tracking-[-0.05em] text-white max-[600px]:text-[34px]">
            Create Song
          </h1>

          <p className="mt-3 max-w-[650px] text-[14px] leading-7 text-[#a4a4b2]">
            Add a song, upload five audio chunks,
            and schedule its daily game date.
          </p>

        </div>


        {/* ==========================================
            FORM CARD
            ========================================== */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-[20px] border border-white/[0.09] bg-white/[0.045] p-8 shadow-[0_25px_70px_rgba(0,0,0,0.25)] max-[600px]:p-5"
        >

          {/* Top accent */}

          <div className="relative -mx-8 -mt-8 mb-8 h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent max-[600px]:-mx-5 max-[600px]:-mt-5" />


          {/* ======================================
              SONG DETAILS
              ====================================== */}

          <div className="grid grid-cols-2 gap-5 max-[700px]:grid-cols-1">


            {/* Song Title */}

            <div className="flex flex-col gap-2">

              <label
                htmlFor="song-title"
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a4a4b2]"
              >
                Song Title
              </label>

              <input
                id="song-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter song title"
                required
                className="min-h-[52px] w-full rounded-[12px] border border-white/[0.09] bg-white/[0.045] px-4 text-[14px] text-white outline-none transition duration-200 placeholder:text-[#5f5f6b] hover:border-white/[0.15] focus:border-[#8b5cf6] focus:bg-white/[0.06] focus:ring-4 focus:ring-[#8b5cf6]/10"
              />

            </div>


            {/* Movie Name */}

            <div className="flex flex-col gap-2">

              <label
                htmlFor="movie-name"
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a4a4b2]"
              >
                Movie Name
              </label>

              <input
                id="movie-name"
                type="text"
                value={movieName}
                onChange={(event) =>
                  setMovieName(event.target.value)
                }
                placeholder="Enter movie name"
                required
                className="min-h-[52px] w-full rounded-[12px] border border-white/[0.09] bg-white/[0.045] px-4 text-[14px] text-white outline-none transition duration-200 placeholder:text-[#5f5f6b] hover:border-white/[0.15] focus:border-[#8b5cf6] focus:bg-white/[0.06] focus:ring-4 focus:ring-[#8b5cf6]/10"
              />

            </div>


          </div>


          {/* ======================================
              GAME DATE
              ====================================== */}

          <div className="mt-6 flex flex-col gap-2">

            <label
              htmlFor="game-date"
              className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a4a4b2]"
            >
              Game Date
            </label>

            <input
              id="game-date"
              type="date"
              value={gameDate}
              min={today}
              onChange={(event) =>
                setGameDate(event.target.value)
              }
              required
              className="min-h-[52px] w-full rounded-[12px] border border-white/[0.09] bg-white/[0.045] px-4 text-[14px] text-white outline-none transition duration-200 hover:border-white/[0.15] focus:border-[#8b5cf6] focus:bg-white/[0.06] focus:ring-4 focus:ring-[#8b5cf6]/10"
            />

            <p className="m-0 text-[12px] leading-5 text-[#696977]">
              Select the date when this song should be
              used as the daily game.
            </p>

          </div>


          {/* ======================================
              AUDIO CHUNKS
              ====================================== */}

          <div className="mt-10 border-t border-white/[0.07] pt-8">

            <div className="mb-6">

              <h2 className="m-0 font-['Space_Grotesk'] text-[24px] font-semibold tracking-[-0.025em] text-white">
                Audio Chunks
              </h2>

              <p className="mt-1.5 text-[13px] text-[#696977]">
                Upload exactly five different audio clips.
              </p>

            </div>


            {/* Chunk Grid */}

            <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">

              {[1, 2, 3, 4, 5].map((number) => (

                <div
                  key={number}
                  className="flex min-h-[92px] items-center gap-4 rounded-[14px] border border-white/[0.08] bg-white/[0.035] p-4 transition duration-200 hover:border-white/[0.14] hover:bg-white/[0.05]"
                >

                  {/* Number */}

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#8b5cf6]/20 to-[#3b82f6]/20 font-['Space_Grotesk'] text-[16px] font-bold text-[#c4b5fd]">
                    {number}
                  </div>


                  {/* Information */}

                  <div className="min-w-0 flex-1">

                    <strong className="block font-['Space_Grotesk'] text-[14px] font-semibold text-white">
                      Chunk {number}
                    </strong>

                    <span className="mt-1 block truncate text-[12px] text-[#696977]">
                      {chunks[number]
                        ? chunks[number].name
                        : "No file selected"}
                    </span>

                  </div>


                  {/* File Button */}

                  <label className="relative shrink-0 cursor-pointer rounded-[9px] border border-white/[0.09] bg-white/[0.055] px-3.5 py-2.5 text-[12px] font-semibold text-[#d0d0d8] transition duration-200 hover:border-[#8b5cf6]/50 hover:bg-white/[0.08] hover:text-white">

                    Choose File

                    <input
                      className="audio-file-input absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      type="file"
                      accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,.mp3,.wav,.ogg,.m4a"
                      onChange={(event) =>
                        handleFileChange(
                          number,
                          event.target.files[0]
                        )
                      }
                    />

                  </label>

                </div>

              ))}

            </div>

          </div>


          {/* ======================================
              ERROR
              ====================================== */}

          {error && (
            <div className="mt-6 rounded-[11px] border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-[13px] leading-5 text-red-300">
              {error}
            </div>
          )}


          {/* ======================================
              SUCCESS
              ====================================== */}

          {message && (
            <div className="mt-6 rounded-[11px] border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-3 text-[13px] leading-5 text-emerald-300">
              {message}
            </div>
          )}


          {/* ======================================
              SUBMIT
              ====================================== */}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 flex min-h-[54px] w-full items-center justify-center rounded-[13px] border-0 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] px-6 text-[14px] font-bold text-white shadow-[0_12px_30px_rgba(99,102,241,0.25)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(99,102,241,0.35)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading
              ? "Creating and scheduling..."
              : "Create & Schedule Game"}
          </button>

        </form>

      </main>

    </div>
  );
}


export default AdminDashboard;