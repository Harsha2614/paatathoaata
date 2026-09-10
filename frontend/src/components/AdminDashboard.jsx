import React, { useState } from "react";
import { uploadSong, logout } from "../api";

function AdminDashboard({ user }) {
  const [title, setTitle] = useState("");
  const [movieName, setMovieName] = useState("");

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

    if (!title.trim()) {
      setError("Please enter the song title.");
      return;
    }

    if (!movieName.trim()) {
      setError("Please enter the movie name.");
      return;
    }

    for (let i = 1; i <= 5; i++) {
      if (!chunks[i]) {
        setError(`Please select audio for Chunk ${i}.`);
        return;
      }
    }

    try {
      setLoading(true);

      const result = await uploadSong({
        title: title.trim(),
        movieName: movieName.trim(),
        chunk1: chunks[1],
        chunk2: chunks[2],
        chunk3: chunks[3],
        chunk4: chunks[4],
        chunk5: chunks[5],
      });

      setMessage(
        `Song "${result.title}" created successfully.`
      );

      setTitle("");
      setMovieName("");

      setChunks({
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
      });

      // Reset file inputs.
      document
        .querySelectorAll(".audio-file-input")
        .forEach((input) => {
          input.value = "";
        });

    } catch (error) {
      setError(error.message);
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

      <header className="admin-navbar">

        <div>
          <strong>GuessTheSong</strong>
          <span> Admin</span>
        </div>

        <div className="admin-user">

          <span>{user.email}</span>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>

      </header>

      <main className="admin-content">

        <div className="admin-heading">
          <p className="eyebrow">Content Management</p>
          <h1>Create Song</h1>
          <p>
            Add a song with exactly five audio chunks.
          </p>
        </div>

        <form
          className="song-upload-card"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>
              Song Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Enter song title"
              required
            />

          </div>

          <div className="form-group">

            <label>
              Movie Name
            </label>

            <input
              type="text"
              value={movieName}
              onChange={(event) =>
                setMovieName(event.target.value)
              }
              placeholder="Enter movie name"
              required
            />

          </div>

          <div className="chunks-section">

            <h2>Audio Chunks</h2>

            <p>
              Upload exactly five different audio clips.
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

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          {message && (
            <div className="admin-success">
              {message}
            </div>
          )}

          <button
            className="create-song-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Uploading..."
              : "Create Song"}
          </button>

        </form>

      </main>

    </div>
  );
}

export default AdminDashboard;