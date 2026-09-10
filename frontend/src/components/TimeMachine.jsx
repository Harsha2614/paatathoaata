import React, { useState } from "react";
import CalendarPicker from "./CalendarPicker";

import {
  Clock3,
  CalendarDays,
  Play,
  Info,
} from "lucide-react";


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


function getYesterdayIST() {
  const today = getTodayIST();

  const [year, month, day] =
    today.split("-").map(Number);

  const yesterday = new Date(
    Date.UTC(
      year,
      month - 1,
      day - 1
    )
  );

  return yesterday
    .toISOString()
    .split("T")[0];
}


/* =========================================================
   TIME MACHINE
========================================================= */

function TimeMachine({ onSelectDate }) {
  const [date, setDate] =
    useState("");

  const [error, setError] =
    useState("");

  const yesterday =
    getYesterdayIST();


  /* =========================================================
     DATE CHANGE
  ========================================================= */

  function handleDateChange(selectedDate) {
    setDate(selectedDate);
    setError("");
  }


  /* =========================================================
     SUBMIT
  ========================================================= */

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
    <div className="min-h-[calc(100vh-72px)] w-full bg-[#080808]">

      <div className="mx-auto w-full max-w-[1100px] px-6 pb-24 pt-12 max-[700px]:px-4 max-[700px]:pb-16 max-[700px]:pt-10">


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 flex items-center justify-between gap-10 max-[700px]:items-start">

          <div>

            {/* REPLAY MODE */}

            <div className="mb-3 flex items-center gap-2">

              <Clock3
                size={17}
                strokeWidth={1.7}
                className="text-[#d99a22]"
              />

              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8c8a87]">
                Replay Mode
              </span>

            </div>


            {/* TITLE */}

            <h1 className="m-0 font-['Georgia'] text-[46px] font-bold leading-[1.05] tracking-[-0.035em] text-[#e9a82f] max-[700px]:text-[36px]">
              TIME MACHINE
            </h1>


            <p className="mt-2 text-[14px] text-[#85817b]">
              Replay any previous daily challenge
            </p>

          </div>


          {/* =================================================
              CLOCK
          ================================================= */}

          <div className="relative flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-full border border-[#8e611c]/60 bg-[#141414] text-[#d99a22] shadow-[0_0_35px_rgba(196,135,30,0.08)] max-[700px]:h-[62px] max-[700px]:w-[62px]">

            <Clock3
              size={34}
              strokeWidth={1.35}
              className="max-[700px]:h-[27px] max-[700px]:w-[27px]"
            />

            <div className="pointer-events-none absolute inset-[-6px] rounded-full border border-dashed border-[#8e611c]/45" />

          </div>

        </div>


        {/* =====================================================
            DATE CARD
        ===================================================== */}

        <section className="relative overflow-visible rounded-[16px] border border-[#5a4424]/70 bg-[#151515] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] max-[700px]:p-5">

          {/* GOLD TOP LINE */}

          <div className="absolute left-1/4 right-1/4 top-0 h-px bg-gradient-to-r from-transparent via-[#c58b28] to-transparent" />


          {/* =================================================
              CARD HEADER
          ================================================= */}

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#6b4b1b] bg-[#1d1a16]">

              <CalendarDays
                size={20}
                strokeWidth={1.6}
                className="text-[#d99a22]"
              />

            </div>


            <div>

              <h2 className="m-0 font-['Georgia'] text-[21px] font-bold text-[#eee6d8]">
                SELECT DATE
              </h2>

              <p className="mt-1 text-[12px] text-[#77736e]">
                Choose a previous daily game to replay.
              </p>

            </div>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>

            <CalendarPicker
              value={date}
              onChange={handleDateChange}
              maxDate={yesterday}
              label="Game Date"
              helperText="Choose a previous daily game to replay."
            />


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mt-4 flex max-w-[460px] items-center gap-2 rounded-[9px] border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-[12px] text-red-300">

                <Info
                  size={14}
                  strokeWidth={1.7}
                  className="shrink-0"
                />

                <span>
                  {error}
                </span>

              </div>
            )}


            {/* =================================================
                PLAY BUTTON
            ================================================= */}

            <button
              type="submit"
              disabled={!date}
              className="mt-6 inline-flex min-h-[48px] min-w-[220px] items-center justify-center gap-2 rounded-[10px] border border-[#8f641d] bg-gradient-to-b from-[#dba13a] to-[#a87320] px-7 text-[13px] font-bold uppercase tracking-[0.08em] text-[#120f0a] shadow-[0_10px_30px_rgba(180,125,30,0.18)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_15px_35px_rgba(180,125,30,0.25)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
            >

              <Play
                size={15}
                strokeWidth={2}
                fill="currentColor"
                className="ml-[1px]"
              />

              PLAY THIS DAY

            </button>

          </form>


          {/* =================================================
              BOTTOM NOTE
          ================================================= */}

          <p className="mt-4 flex items-center gap-2 text-[11px] text-[#68645f]">

            <Clock3
              size={12}
              strokeWidth={1.6}
              className="shrink-0 text-[#806126]"
            />

            <span>
              Time Machine results are tracked separately from your daily streak.
            </span>

          </p>

        </section>


        {/* =====================================================
            INFORMATION
        ===================================================== */}

        <section className="mt-5 flex items-start gap-3 rounded-[14px] border border-[#30291f] bg-[#111111] px-5 py-4">

          {/* INFO ICON */}

          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#72501b]">

            <Info
              size={14}
              strokeWidth={1.8}
              className="text-[#d99a22]"
            />

          </div>


          {/* INFORMATION TEXT */}

          <div>

            <h3 className="m-0 font-['Georgia'] text-[16px] font-bold text-[#e7dfd1]">
              About Time Machine
            </h3>


            <p className="mt-1 text-[12px] leading-5 text-[#77736e]">
              Replay games you missed in the past.
              Time Machine games do not affect your
              statistics, streak, history, or score distribution.
            </p>

          </div>

        </section>


      </div>

    </div>
  );
}


export default TimeMachine;