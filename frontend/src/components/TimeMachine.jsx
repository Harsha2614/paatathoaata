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

  const [year, month, day] = today
    .split("-")
    .map(Number);

  const yesterday = new Date(
    Date.UTC(year, month - 1, day - 1)
  );

  return yesterday.toISOString().split("T")[0];
}

function TimeMachine({ onSelectDate }) {
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const yesterday = getYesterdayIST();

  function handleSubmit(event) {
    event.preventDefault();

    if (!date) {
      setError("Please select a previous date.");
      return;
    }

    onSelectDate(date);
  }

  return (
    <div className="min-h-[calc(100vh-72px)] w-full">
      <div className="mx-auto w-full max-w-[1100px] px-6 pb-24 pt-16 max-[700px]:px-4 max-[700px]:pb-16 max-[700px]:pt-12">

        {/* =================================================
            PAGE HEADER
            ================================================= */}

        <div className="mb-10 flex items-center justify-between gap-12 max-[700px]:items-start max-[700px]:gap-5">

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#a78bfa]">
              Time Machine
            </p>

            <h1 className="m-0 font-['Space_Grotesk'] text-[48px] font-bold leading-[1.05] tracking-[-0.055em] text-white max-[700px]:text-[34px]">
              Replay a Previous Game
            </h1>

            <p className="mt-3 max-w-[650px] text-[15px] leading-7 text-[#a4a4b2]">
              Missed a daily game? Travel back
              and play a previous game.
            </p>
          </div>


          {/* CLOCK */}

          <div className="relative flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-full border border-[#ffffff17] bg-white/[0.045] text-[38px] shadow-[0_12px_30px_rgba(0,0,0,0.25)] max-[700px]:h-[60px] max-[700px]:w-[60px] max-[700px]:text-[27px]">
            🕘

            <div className="pointer-events-none absolute inset-0 scale-[1.12] rounded-full border border-dashed border-[#8b5cf655]" />
          </div>

        </div>


        {/* =================================================
            DATE CARD
            ================================================= */}

        <section className="relative overflow-hidden rounded-[20px] border border-white/[0.09] bg-white/[0.045] p-[34px] shadow-[0_25px_70px_rgba(0,0,0,0.25)] max-[700px]:p-[22px]">

          {/* TOP ACCENT */}

          <div className="absolute left-1/4 right-1/4 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent" />


          {/* CARD HEADER */}

          <div className="mb-8 flex items-center gap-4">

            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] border border-white/[0.09] bg-white/[0.055] text-[23px]">
              📅
            </div>

            <div>

              <h2 className="m-0 font-['Space_Grotesk'] text-[24px] font-semibold tracking-[-0.02em] text-white">
                Select a Previous Date
              </h2>

              <p className="mt-1 text-[13px] text-[#696977]">
                Choose any daily game from the past.
              </p>

            </div>

          </div>


          {/* =================================================
              FORM
              ================================================= */}

          <form onSubmit={handleSubmit}>

            <div className="flex flex-col gap-2">

              <label
                htmlFor="time-machine-date"
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a4a4b2]"
              >
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
                className="min-h-[58px] w-full cursor-pointer rounded-[12px] border border-white/[0.09] bg-white/[0.045] px-[17px] font-['DM_Sans'] text-[15px] text-white outline-none transition duration-200 hover:border-[#8b5cf699] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf61a]"
              />

            </div>


            {/* ERROR */}

            {error && (
              <div className="mt-3 rounded-[10px] border border-red-400/20 bg-red-400/[0.07] px-3 py-2.5 text-[13px] text-red-300">
                {error}
              </div>
            )}


            {/* TRAVEL BUTTON */}

            <button
              type="submit"
              disabled={!date}
              className="mt-6 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[13px] border-0 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] px-7 text-[14px] font-bold text-white shadow-[0_12px_30px_rgba(99,102,241,0.25)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(99,102,241,0.35)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[0_12px_30px_rgba(99,102,241,0.25)]"
            >
              🕘 Travel Back
            </button>

          </form>

        </section>


        {/* =================================================
            INFORMATION CARD
            ================================================= */}

        <section className="mt-6 flex items-start gap-4 rounded-[18px] border border-white/[0.09] bg-white/[0.035] px-6 py-5 max-[700px]:px-5">

          <div className="shrink-0 text-[20px] text-[#a78bfa]">
            ⓘ
          </div>

          <div>

            <h3 className="m-0 font-['Space_Grotesk'] text-[18px] font-semibold text-white">
              About Time Machine
            </h3>

            <p className="mt-1.5 text-[13px] leading-6 text-[#a4a4b2]">
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