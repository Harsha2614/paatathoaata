import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";


/* =========================================================
   DATE HELPERS
========================================================= */

function parseDate(dateString) {
  if (!dateString) {
    return null;
  }

  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}


function formatDate(date) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =========================================================
   CALENDAR PICKER
========================================================= */

function CalendarPicker({
  value,
  onChange,
  minDate,
  maxDate,
  label = "Select Date",
  helperText = "",
}) {
  const containerRef =
    useRef(null);

  const initialDate =
    parseDate(value) ||
    parseDate(minDate) ||
    new Date();


  const [
    currentMonth,
    setCurrentMonth,
  ] = useState(
    new Date(
      initialDate.getFullYear(),
      initialDate.getMonth(),
      1
    )
  );


  const [open, setOpen] =
    useState(false);


  const [openAbove, setOpenAbove] =
    useState(false);


  /* =========================================================
     CLOSE WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


  /* =========================================================
     CALENDAR POSITION
  ========================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }


    function updateCalendarPosition() {
      if (!containerRef.current) {
        return;
      }


      const rect =
        containerRef.current.getBoundingClientRect();


      const calendarHeight = 400;
      const gap = 10;

      const safeTop = 80;


      const spaceBelow =
        window.innerHeight -
        rect.bottom -
        gap;


      const spaceAbove =
        rect.top -
        safeTop -
        gap;


      if (
        spaceBelow < calendarHeight &&
        spaceAbove >= calendarHeight
      ) {
        setOpenAbove(true);
      } else {
        setOpenAbove(false);
      }
    }


    updateCalendarPosition();


    window.addEventListener(
      "resize",
      updateCalendarPosition
    );

    window.addEventListener(
      "scroll",
      updateCalendarPosition,
      true
    );


    return () => {
      window.removeEventListener(
        "resize",
        updateCalendarPosition
      );

      window.removeEventListener(
        "scroll",
        updateCalendarPosition,
        true
      );
    };
  }, [open]);


  /* =========================================================
     KEEP SELECTED MONTH
  ========================================================= */

  useEffect(() => {
    const selectedDate =
      parseDate(value);

    if (selectedDate) {
      setCurrentMonth(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        )
      );
    }
  }, [value]);


  /* =========================================================
     MONTH VALUES
  ========================================================= */

  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();


  const monthName =
    currentMonth.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );


  const weekdays = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];


  const firstDayOfMonth =
    new Date(
      year,
      month,
      1
    ).getDay();


  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  const todayString =
    useMemo(
      () =>
        new Intl.DateTimeFormat(
          "en-CA",
          {
            timeZone:
              "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }
        ).format(new Date()),
      []
    );


  /* =========================================================
     MONTH RESTRICTIONS
  ========================================================= */

  const isMonthBeforeMin =
    () => {
      if (!minDate) {
        return false;
      }

      const min =
        parseDate(minDate);

      return (
        year <
          min.getFullYear() ||
        (
          year ===
            min.getFullYear() &&
          month <
            min.getMonth()
        )
      );
    };


  const isMonthAfterMax =
    () => {
      if (!maxDate) {
        return false;
      }

      const max =
        parseDate(maxDate);

      return (
        year >
          max.getFullYear() ||
        (
          year ===
            max.getFullYear() &&
          month >
            max.getMonth()
        )
      );
    };


  /* =========================================================
     MONTH NAVIGATION
  ========================================================= */

  const previousMonth = () => {
    if (isMonthBeforeMin()) {
      return;
    }

    setCurrentMonth(
      new Date(
        year,
        month - 1,
        1
      )
    );
  };


  const nextMonth = () => {
    if (isMonthAfterMax()) {
      return;
    }

    setCurrentMonth(
      new Date(
        year,
        month + 1,
        1
      )
    );
  };


  /* =========================================================
     DATE DISABLED
  ========================================================= */

  const isDateDisabled =
    (dateString) => {
      if (
        minDate &&
        dateString < minDate
      ) {
        return true;
      }

      if (
        maxDate &&
        dateString > maxDate
      ) {
        return true;
      }

      return false;
    };


  /* =========================================================
     DISPLAY VALUE
  ========================================================= */

  const displayValue =
    value
      ? parseDate(value)?.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        )
      : "Select a date";


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[460px]"
    >


      {/* =====================================================
          LABEL
      ===================================================== */}

      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#a4a4b2]">
        {label}
      </label>


      {/* =====================================================
          DATE BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          setOpen(
            (previous) =>
              !previous
          )
        }
        className={`
          flex
          min-h-[56px]
          w-full
          items-center
          justify-between
          rounded-[13px]
          border
          px-4
          text-left
          transition
          duration-200

          ${
            open
              ? "border-[#c58b28] bg-[#1b1916] ring-4 ring-[#c58b28]/10"
              : "border-[#4c3b23] bg-[#151515] hover:border-[#8b6322] hover:bg-[#191816]"
          }
        `}
      >

        <div className="flex items-center gap-3">


          {/* CALENDAR ICON */}

          <div
            className={`
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-[9px]
              transition

              ${
                open
                  ? "bg-[#d99a22]/15 text-[#e5a32d]"
                  : "bg-white/[0.055] text-[#9b8d78]"
              }
            `}
          >

            <CalendarDays
              size={18}
              strokeWidth={1.6}
            />

          </div>


          {/* DATE */}

          <div>

            <p
              className={`
                m-0
                text-[14px]
                font-semibold

                ${
                  value
                    ? "text-[#eee8dd]"
                    : "text-[#706c66]"
                }
              `}
            >
              {displayValue}
            </p>

          </div>

        </div>


        {/* CHEVRON */}

        <span
          className={`
            flex
            items-center
            justify-center
            text-[#77716a]
            transition
            duration-200

            ${
              open
                ? "rotate-180 text-[#d99a22]"
                : ""
            }
          `}
        >

          <ChevronDown
            size={17}
            strokeWidth={1.7}
          />

        </span>

      </button>


      {/* =====================================================
          HELPER TEXT
      ===================================================== */}

      {helperText && (
        <p className="mt-2 text-[12px] leading-5 text-[#69645e]">
          {helperText}
        </p>
      )}


      {/* =====================================================
          CALENDAR DROPDOWN
      ===================================================== */}

      {open && (
        <div
          className={`
            absolute
            left-0
            z-[100]
            w-full
            min-w-[330px]
            max-w-[430px]
            overflow-hidden
            rounded-[18px]
            border
            border-[#493b29]
            bg-[#111111]
            shadow-[0_25px_80px_rgba(0,0,0,0.65)]

            ${
              openAbove
                ? "bottom-[calc(100%+10px)]"
                : "top-[calc(100%+10px)]"
            }
          `}
        >


          {/* =================================================
              TOP GOLD GLOW
          ================================================= */}

          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#d99a22] to-transparent" />


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex items-center justify-between border-b border-[#332b20] px-4 py-4">

            <div>

              <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#b37b20]">
                Choose Date
              </p>


              <h3 className="font-['Georgia'] text-[18px] font-bold text-[#eee8dd]">
                {monthName}
              </h3>

            </div>


            {/* MONTH NAVIGATION */}

            <div className="flex items-center gap-1.5">

              <button
                type="button"
                onClick={previousMonth}
                disabled={
                  isMonthBeforeMin()
                }
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#40372b] bg-[#191817] text-[#aaa39a] transition hover:border-[#76531b] hover:bg-[#211d17] hover:text-[#e6dfd4] disabled:cursor-not-allowed disabled:opacity-20"
              >

                <ChevronLeft
                  size={16}
                  strokeWidth={1.8}
                />

              </button>


              <button
                type="button"
                onClick={nextMonth}
                disabled={
                  isMonthAfterMax()
                }
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#40372b] bg-[#191817] text-[#aaa39a] transition hover:border-[#76531b] hover:bg-[#211d17] hover:text-[#e6dfd4] disabled:cursor-not-allowed disabled:opacity-20"
              >

                <ChevronRight
                  size={16}
                  strokeWidth={1.8}
                />

              </button>

            </div>

          </div>


          {/* =================================================
              CALENDAR BODY
          ================================================= */}

          <div className="p-4">


            {/* WEEKDAYS */}

            <div className="mb-1 grid grid-cols-7">

              {weekdays.map(
                (day) => (
                  <div
                    key={day}
                    className="flex h-8 items-center justify-center text-[9px] font-bold uppercase tracking-[0.05em] text-[#625d56]"
                  >
                    {day}
                  </div>
                )
              )}

            </div>


            {/* DAYS */}

            <div className="grid grid-cols-7 gap-1">


              {/* EMPTY DAYS */}

              {Array.from({
                length:
                  firstDayOfMonth,
              }).map(
                (_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="h-10"
                  />
                )
              )}


              {/* MONTH DAYS */}

              {Array.from({
                length:
                  daysInMonth,
              }).map(
                (_, index) => {

                  const day =
                    index + 1;


                  const dateString =
                    formatDate(
                      new Date(
                        year,
                        month,
                        day
                      )
                    );


                  const disabled =
                    isDateDisabled(
                      dateString
                    );


                  const selected =
                    value ===
                    dateString;


                  const isToday =
                    todayString ===
                    dateString;


                  return (
                    <button
                      key={dateString}
                      type="button"
                      disabled={disabled}
                      aria-label={`Select ${dateString}`}
                      aria-pressed={
                        selected
                      }
                      onClick={() => {

                        if (disabled) {
                          return;
                        }

                        onChange(
                          dateString
                        );

                        setOpen(false);

                      }}
                      className={`
                        relative
                        flex
                        h-10
                        items-center
                        justify-center
                        rounded-[9px]
                        text-[12px]
                        font-semibold
                        transition
                        duration-150

                        ${
                          disabled
                            ? "cursor-not-allowed text-[#34322f]"
                            : selected
                              ? "bg-gradient-to-br from-[#e0a12e] to-[#a96f19] text-[#171108] shadow-[0_7px_18px_rgba(210,148,35,0.28)]"
                              : "text-[#c7c0b6] hover:bg-[#27231d] hover:text-[#f2ebe0]"
                        }
                      `}
                    >

                      {day}


                      {/* TODAY DOT */}

                      {isToday &&
                        !selected && (
                          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#d99a22]" />
                        )}

                    </button>
                  );
                }
              )}

            </div>

          </div>


          {/* =================================================
              SELECTED DATE FOOTER
          ================================================= */}

          <div className="border-t border-[#332b20] bg-[#181715] px-4 py-3">

            {value ? (

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#655f58]">
                    Selected
                  </p>


                  <p className="mt-0.5 text-[12px] font-semibold text-[#eee8dd]">
                    {parseDate(
                      value
                    )?.toLocaleDateString(
                      "en-US",
                      {
                        weekday:
                          "long",
                        month:
                          "long",
                        day:
                          "numeric",
                        year:
                          "numeric",
                      }
                    )}
                  </p>

                </div>


                {/* CHECK ICON */}

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d99a22]/12 text-[#dca02d]">

                  <Check
                    size={14}
                    strokeWidth={2.2}
                  />

                </span>

              </div>

            ) : (

              <p className="m-0 text-[11px] text-[#69645e]">
                Select a date from the calendar.
              </p>

            )}

          </div>


        </div>
      )}

    </div>
  );
}


export default CalendarPicker;