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
      setError(
        "Game date cannot be earlier than today."
      );
      return;
    }


    // Validate all five chunks
    for (let i = 1; i <= 5; i++) {
      if (!chunks[i]) {
        setError(
          `Please select audio for Chunk ${i}.`
        );
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
      // STEP 2: SCHEDULE SONG FOR SELECTED DATE
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
    <div className="admin-page">


      {/* ==========================================
          ADMIN NAVBAR
          ========================================== */}

      <header className="admin-navbar">

        <div>
          <strong>GuessTheSong</strong>
          <span> Admin</span>
        </div>


        <div className="admin-user">

          <span>
            {user.email}
          </span>


          <button onClick={handleLogout}>
            Logout
          </button>

        </div>

      </header>



      {/* ==========================================
          ADMIN CONTENT
          ========================================== */}

      <main className="admin-content">


        <div className="admin-heading">

          <p className="eyebrow">
            Content Management
          </p>

          <h1>
            Create Song
          </h1>

          <p>
            Add a song, upload five audio chunks,
            and schedule its daily game date.
          </p>

        </div>



        <form
          className="song-upload-card"
          onSubmit={handleSubmit}
        >


          {/* ======================================
              SONG TITLE
              ====================================== */}

          <div className="form-group">

            <label htmlFor="song-title">
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
            />

          </div>



          {/* ======================================
              MOVIE NAME
              ====================================== */}

          <div className="form-group">

            <label htmlFor="movie-name">
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
            />

          </div>



          {/* ======================================
              GAME DATE
              ====================================== */}

          <div className="form-group">

            <label htmlFor="game-date">
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
            />

            <small>
              Select the date when this song should
              be used as the daily game.
            </small>

          </div>



          {/* ======================================
              AUDIO CHUNKS
              ====================================== */}

          <div className="chunks-section">

            <h2>
              Audio Chunks
            </h2>

            <p>
              Upload exactly five different
              audio clips.
            </p>


            <div className="chunk-grid">

              {[1, 2, 3, 4, 5].map((number) => (

                <div
                  className="chunk-upload"
                  key={number}
                >


                  <div className="chunk-number">
                    {number}
                  </div>


                  <div className="chunk-info">

                    <strong>
                      Chunk {number}
                    </strong>

                    <span>
                      {chunks[number]
                        ? chunks[number].name
                        : "No file selected"}
                    </span>

                  </div>


                  <label className="file-button">

                    Choose File

                    <input
                      className="audio-file-input"
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
            <div className="admin-error">
              {error}
            </div>
          )}



          {/* ======================================
              SUCCESS
              ====================================== */}

          {message && (
            <div className="admin-success">
              {message}
            </div>
          )}



          {/* ======================================
              SUBMIT
              ====================================== */}

          <button
            className="create-song-button"
            type="submit"
            disabled={loading}
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