"use client";

import * as React from "react";
import { useId, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { pad } from "@/lib/utils/string";

type Variant = "dateOnly" | "timeToMinutes" | "timeToSeconds";
type Mode = "single" | "range";

interface DatePickerProps {
  label?: string;
  variant?: Variant;
  mode?: Mode;
  timezone?: string;
  value?: Date | [Date | null, Date | null] | null;
  onChange?: (val: Date | [Date | null, Date | null] | null) => void;
  className?: string;
  onConfirm?: (val: Date | [Date | null, Date | null] | null) => void;
}

function toDateOnlyString(d: Date | null, tz?: string) {
  if (!d) return "";
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return new Intl.DateTimeFormat("en-CA", opts).format(d);
}

// --- End of new function ---

export default function DatePicker({
  label,
  variant = "dateOnly",
  mode = "single",
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  value = null,
  onChange,
  onConfirm,
  // className,
}: DatePickerProps) {
  const id = useId();

  const [selSingle, setSelSingle] = React.useState<Date | null>(
    () => (value instanceof Date ? new Date(value) : null)
  );
  const [selRange, setSelRange] = React.useState<[Date | null, Date | null]>(() => {
    if (Array.isArray(value))
      return [value[0] ? new Date(value[0]) : null, value[1] ? new Date(value[1]) : null];
    return [null, null];
  });

  const [open, setOpen] = React.useState(false);
  const initDate = selSingle ?? selRange[1] ?? new Date();
  const [viewMonth, setViewMonth] = React.useState(initDate.getMonth());
  const [viewYear, setViewYear] = React.useState(initDate.getFullYear());
  const [hoverDay, setHoverDay] = React.useState<number | null>(null);

  const [timeSingle, setTimeSingle] = React.useState<{ h: number; m: number; s: number }>(() => {
    const d = selSingle ?? new Date();
    return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() };
  });

  const [timeRange, setTimeRange] = React.useState<{
    start: { h: number; m: number; s: number };
    end: { h: number; m: number; s: number };
  }>(() => {
    const s0 = selRange[0] ?? new Date();
    const s1 = selRange[1] ?? new Date();
    return {
      start: { h: s0.getHours(), m: s0.getMinutes(), s: s0.getSeconds() },
      end: { h: s1.getHours(), m: s1.getMinutes(), s: s1.getSeconds() },
    };
  });

  useEffect(() => {
    if (value instanceof Date) {
      setSelSingle(new Date(value));
      const d = new Date(value);
      setTimeSingle({ h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() });
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
    } else if (Array.isArray(value)) {
      setSelRange([
        value[0] ? new Date(value[0]) : null,
        value[1] ? new Date(value[1]) : null,
      ]);
      const s0 = value[0] ? new Date(value[0]) : new Date();
      const s1 = value[1] ? new Date(value[1]) : new Date();
      setTimeRange({
        start: { h: s0.getHours(), m: s0.getMinutes(), s: s0.getSeconds() },
        end: { h: s1.getHours(), m: s1.getMinutes(), s: s1.getSeconds() },
      });
      const ref = value[1] ?? value[0] ?? new Date();
      setViewMonth(ref.getMonth());
      setViewYear(ref.getFullYear());
    }
  }, [value]);

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstWeekday = (y: number, m: number) => new Date(y, m, 1).getDay();

  const provisionalRangeRef = React.useRef<[Date | null, Date | null] | null>(null);

  function applyTimeToDate(d: Date | null, t: { h: number; m: number; s: number }) {
    if (!d) return d;
    const nd = new Date(d);
    nd.setHours(t.h, t.m, t.s);
    return nd;
  }

  // --- Live-sync changes for single mode ---
  function clickDaySingle(day: number) {
    const d = applyTimeToDate(new Date(viewYear, viewMonth, day), timeSingle);
    setSelSingle(d);
    onChange?.(d);
    onConfirm?.(d);
  }

  function handleTimeChangeSingle(key: keyof typeof timeSingle, val: number) {
    const max = key === "h" ? 23 : 59;
    const newTime = { ...timeSingle, [key]: Math.min(max, Math.max(0, val)) };
    setTimeSingle(newTime);
    if (selSingle) {
      const updated = applyTimeToDate(selSingle, newTime);
      setSelSingle(updated);
      onChange?.(updated);
      onConfirm?.(updated);
    }
  }

  // --- Live-sync changes for range mode ---
  function clickDayRange(day: number) {
    const clicked = new Date(viewYear, viewMonth, day);
    const [start, end] = provisionalRangeRef.current ?? selRange;
    if (!start || (start && end)) {
      provisionalRangeRef.current = [clicked, null];
      setSelRange([clicked, null]);
      onChange?.([clicked, null]);
      onConfirm?.([clicked, null]);
    } else if (start && !end) {
      const a = start;
      const b = clicked < a ? clicked : a;
      const c = clicked < a ? a : clicked;
      const startApplied = applyTimeToDate(b, timeRange.start);
      const endApplied = applyTimeToDate(c, timeRange.end);
      provisionalRangeRef.current = [startApplied, endApplied];
      setSelRange([startApplied, endApplied]);
      onChange?.([startApplied, endApplied]);
      onConfirm?.([startApplied, endApplied]);
    }
    setHoverDay(null);
  }

  function handleTimeChangeRange(
    which: "start" | "end",
    key: "h" | "m" | "s",
    val: number
  ) {
    const max = key === "h" ? 23 : 59;
    setTimeRange((t) => {
      const newTimes = {
        ...t,
        [which]: { ...t[which], [key]: Math.min(max, Math.max(0, val)) },
      };
      const start = applyTimeToDate(selRange[0], newTimes.start);
      const end = applyTimeToDate(selRange[1], newTimes.end);
      const out: [Date | null, Date | null] = [start, end];
      setSelRange(out);
      onChange?.(out);
      onConfirm?.(out);
      return newTimes;
    });
  }

  function onConfirmClick() {
    // Kept for optional use (no longer required for live sync)
    setOpen(false);
    provisionalRangeRef.current = null;
  }

  function onCancelClick() {
    provisionalRangeRef.current = null;
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  const renderCalendar = () => {
    const total = daysInMonth(viewYear, viewMonth);
    const first = firstWeekday(viewYear, viewMonth);
    const blanks = Array.from({ length: first }, (_, i) => <div key={`b${i}`} />);

    const days = Array.from({ length: total }, (_, i) => {
      const day = i + 1;
      const dayDate = new Date(viewYear, viewMonth, day);
      const start = selRange[0];
      const end = selRange[1];
      let inRange = false;
      let isStart = false;
      let isEnd = false;
      if (start && end) {
        inRange = dayDate >= start && dayDate <= end;
        isStart = dayDate.getTime() === start.getTime();
        isEnd = dayDate.getTime() === end.getTime();
      }
      if (start && !end && hoverDay != null) {
        const hoverDate = new Date(viewYear, viewMonth, hoverDay);
        const [min, max] = hoverDate < start ? [hoverDate, start] : [start, hoverDate];
        inRange = dayDate >= min && dayDate <= max;
        isStart = dayDate.getTime() === min.getTime();
        isEnd = dayDate.getTime() === max.getTime();
      }
      const isSelectedSingle =
        mode === "single" &&
        selSingle &&
        selSingle.getFullYear() === viewYear &&
        selSingle.getMonth() === viewMonth &&
        selSingle.getDate() === day;
      return (
        <button
          key={day}
          type="button"
          onClick={() => (mode === "single" ? clickDaySingle(day) : clickDayRange(day))}
          onMouseEnter={() => mode === "range" && setHoverDay(day)}
          onMouseLeave={() => mode === "range" && setHoverDay(null)}
          className={cn(
            "h-8 w-8 rounded-md text-sm transition-colors",
            inRange && "bg-[hsl(var(--muted)/0.5)]",
            isStart &&
              "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] rounded-l-md",
            isEnd &&
              "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] rounded-r-md",
            isSelectedSingle &&
              "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
            !inRange &&
              !isSelectedSingle &&
              !isStart &&
              !isEnd &&
              "hover:bg-[hsl(var(--accent)/0.08)]"
          )}
        >
          {day}
        </button>
      );
    });

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-[hsl(var(--input)/0.06)]">
            ‹
          </button>
          <div className="text-sm font-medium">
            {new Intl.DateTimeFormat("en", {
              month: "long",
              year: "numeric",
              timeZone: timezone,
            }).format(new Date(viewYear, viewMonth, 1))}
          </div>
          <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-[hsl(var(--input)/0.06)]">
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs text-center font-semibold mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {blanks}
          {days}
        </div>
      </div>
    );
  };

  const numericClass =
    "w-14 h-10 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  const displaySingle = toDateOnlyString(selSingle, timezone);
  const displayRange =
    selRange[0] && selRange[1]
      ? `${toDateOnlyString(selRange[0], timezone)} → ${toDateOnlyString(selRange[1], timezone)}`
      : "";

  return (
    <div className={`relative grid w-full items-center gap-x-2 ${label ? "gap-y-2" : ""}`}>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="flex items-center gap-2">
        <button
          id={id}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 items-center justify-between w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 text-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          <span className="text-sm text-[hsl(var(--foreground))]">
            {mode === "single" ? displaySingle || "Select date" : displayRange || "Select range"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Time inputs: single or range */}
        {variant !== "dateOnly" && mode === "single" && (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={23}
              value={pad(timeSingle.h)}
              onChange={(e) => handleTimeChangeSingle("h", Number(e.target.value))}
              className={numericClass}
            />
            <span>:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={pad(timeSingle.m)}
              onChange={(e) => handleTimeChangeSingle("m", Number(e.target.value))}
              className={numericClass}
            />
            {variant === "timeToSeconds" && (
              <>
                <span>:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={pad(timeSingle.s)}
                  onChange={(e) => handleTimeChangeSingle("s", Number(e.target.value))}
                  className={numericClass}
                />
              </>
            )}
          </div>
        )}

        {variant !== "dateOnly" && mode === "range" && (
          <div className="flex items-center gap-2">
            {(["start", "end"] as const).map((which) => (
              <div key={which} className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={pad(timeRange[which].h)}
                  onChange={(e) =>
                    handleTimeChangeRange(which, "h", Number(e.target.value))
                  }
                  className={numericClass}
                />
                <span>:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={pad(timeRange[which].m)}
                  onChange={(e) =>
                    handleTimeChangeRange(which, "m", Number(e.target.value))
                  }
                  className={numericClass}
                />
                {variant === "timeToSeconds" && (
                  <>
                    <span>:</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={pad(timeRange[which].s)}
                      onChange={(e) =>
                        handleTimeChangeRange(which, "s", Number(e.target.value))
                      }
                      className={numericClass}
                    />
                  </>
                )}
                {which === "start" && (
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">—</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-[360px] rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 shadow-lg">
          {renderCalendar()}
          <div className="mt-3 flex justify-between items-center gap-3">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              Timezone: {timezone}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancelClick}
                className="px-3 py-1 rounded-md border border-[hsl(var(--input))] text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmClick}
                className="px-3 py-1 rounded-md bg-[hsl(var(--accent))] text-sm text-[hsl(var(--accent-foreground))]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}