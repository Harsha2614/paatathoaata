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
      const [statsData, historyData] = await Promise.all([
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

  if (loading) {
    return (
      <div className="dashboard">
        Loading...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard">
        <p>Unable to load stats.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Your Statistics</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="stats-grid">

        <StatCard
          label="Current Streak"
          value={stats.current_streak}
        />

        <StatCard
          label="Best Streak"
          value={stats.best_streak}
        />

        <StatCard
          label="Games Played"
          value={stats.games_played}
        />

        <StatCard
          label="Wins"
          value={stats.games_won}
        />

        <StatCard
          label="Average Guesses"
          value={stats.average_guesses}
        />

        <StatCard
          label="Total Score"
          value={stats.total_score}
        />

        <StatCard
          label="Win Rate"
          value={`${stats.win_rate}%`}
        />

      </div>

      <section className="history-section">
        <h2>Game History</h2>

        {history.length === 0 ? (
          <p>No games played yet.</p>
        ) : (
          <div className="history-list">
            {history.map((game) => (
              <div
                className="history-row"
                key={game.game_date}
              >
                <span>
                  {game.game_date}
                </span>

                <span>
                  {game.status === "WON"
                    ? "Won"
                    : "Lost"}
                </span>

                <span>
                  {game.attempts} guesses
                </span>

                <strong>
                  {game.score} pts
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default Dashboard;