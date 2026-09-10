const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");


async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,

    credentials: "include",

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Something went wrong",
    }));

    throw new Error(
      error.detail || "Request failed"
    );
  }

  return response.json();
}


/* =========================
   PLAYER AUTH
========================= */

export async function initializeAnonymousPlayer() {
  return request("/api/auth/anonymous", {
    method: "POST",
  });
}


export async function getCurrentUser() {
  return request("/api/auth/me");
}


export async function logout() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}


/* =========================
   GAME
========================= */

export async function getTodayGame() {
  return request("/api/game/today");
}
export async function getGameByDate(date) {
  return request(`/api/game/date/${date}`);
}


export async function submitGuess(
  gameSessionId,
  guess
) {
  return request("/api/game/guess", {
    method: "POST",

    body: JSON.stringify({
      game_session_id: gameSessionId,
      guess,
    }),
  });
}


/* =========================
   STATS
========================= */

export async function getStats() {
  return request("/api/stats/me");
}


export async function getHistory() {
  return request("/api/stats/history");
}


export async function getGuessDistribution() {
  return request(
    "/api/stats/guess-distribution"
  );
}


/* =========================
   ADMIN AUTH
========================= */

export async function adminLogin(
  email,
  password
) {
  return request("/api/auth/admin/login", {
    method: "POST",

    body: JSON.stringify({
      email,
      password,
    }),
  });
}


/* =========================
   ADMIN SONG UPLOAD
========================= */

export async function uploadSong({
  title,
  movieName,
  chunk1,
  chunk2,
  chunk3,
  chunk4,
  chunk5,
}) {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("movie_name", movieName);

  formData.append("chunk_1", chunk1);
  formData.append("chunk_2", chunk2);
  formData.append("chunk_3", chunk3);
  formData.append("chunk_4", chunk4);
  formData.append("chunk_5", chunk5);

  const response = await fetch(
    `${API_URL}/api/admin/songs/upload`,
    {
      method: "POST",

      credentials: "include",

      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Upload failed",
    }));

    throw new Error(
      error.detail || "Upload failed"
    );
  }

  return response.json();

  
}

export async function scheduleDailyGame(
  songId,
  gameDate
) {
  return request("/api/admin/daily-games", {
    method: "POST",
    body: JSON.stringify({
      song_id: songId,
      game_date: gameDate,
    }),
  });
}