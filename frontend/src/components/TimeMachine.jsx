import React, { useState } from "react";


function getTodayIST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}


function getYesterdayIST() {
  const today = getTodayIST();

  const [year, month, day] =
    today.split("-").map(Number);

  const yesterday = new Date(
    Date.UTC(year, month - 1, day - 1)
  );

  return yesterday
    .toISOString()
    .split("T")[0];
}


function TimeMachine({ onSelectDate }) {
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const yesterday = getYesterdayIST();


  function handleSubmit(event) {
    event.preventDefault();

    if (!date) {
      setError(
        "Please select a previous date."
      );
      return;
    }

    onSelectDate(date);
  }


  return (
    <div className="time-machine-page">

      <div className="time-machine-content">

        {/* ======================================
            HEADER
            ====================================== */}

        <div className="time-machine-page-header">

          <div>

            <p className="eyebrow">
              Time Machine
            </p>

            <h1>
              Replay a Previous Game
            </h1>

            <p className="time-machine-description">
              Missed a daily game? Travel back
              and play a previous game.
            </p>

          </div>


          <div className="time-machine-icon">
            🕘
          </div>

        </div>


        {/* ======================================
            DATE CARD
            ====================================== */}

        <section className="time-machine-date-card">

          <div className="time-machine-date-heading">

            <span className="time-machine-date-icon">
              📅
            </span>

            <div>

              <h2>
                Select a Previous Date
              </h2>

              <p>
                Choose any daily game from the past.
              </p>

            </div>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="time-machine-date-input">

              <label htmlFor="time-machine-date">
                Game Date
              </label>

              <input
                id="time-machine-date"
                type="date"
                value={date}
                max={yesterday}
                onChange={(event) => {
                  setDate(event.target.value);
                  setError("");
                }}
              />

            </div>


            {error && (
              <p className="time-machine-error">
                {error}
              </p>
            )}


            <button
              type="submit"
              className="time-machine-travel-button"
              disabled={!date}
            >
              🕘 Travel Back
            </button>

          </form>

        </section>


        {/* ======================================
            INFORMATION CARD
            ====================================== */}

        <section className="time-machine-info-card">

          <div className="time-machine-info-icon">
            ⓘ
          </div>

          <div>

            <h3>
              About Time Machine
            </h3>

            <p>
              Replay games you missed in the past.
              Time Machine games do not affect your
              statistics, streak, history, or score
              distribution.
            </p>

          </div>

        </section>

      </div>

    </div>
  );
}


export default TimeMachine;