"use client"

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import {
  DayButton,
  DayPicker,
  type DayButtonProps,
  type Matcher
} from "react-day-picker";

type Props = {
  sessionDates: string[]
  onDaySelect: (date: string | null) => void
  selectedDate?: string | null
}

function parseYMD(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function CustomDayButton(props: DayButtonProps) {
  const hasSession = Boolean(props.modifiers.hasSession);
  const isSelected = Boolean(props.modifiers.selected);

  return (
    <DayButton
      {...props}
      className={`${props.className ?? ""} relative flex h-10 w-10 flex-col items-center justify-center`}
    >
      <span>{props.children}</span>
      {hasSession && (
        <span
          className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-accent"}`}
        />
      )}
    </DayButton>
  );
}

export default function WorkoutCalendar({
  sessionDates,
  onDaySelect,
  selectedDate
}: Props) {
  const selected = selectedDate ? parseYMD(selectedDate) : undefined;
  const sessionMatchers = useMemo(
    () => sessionDates.map((value) => parseYMD(value)) as Matcher[],
    [sessionDates]
  );

  return (
    <DayPicker
      mode="single"
      selected={selected}
      weekStartsOn={1}
      navLayout="around"
      showOutsideDays
      onSelect={(date) => onDaySelect(date ? formatYMD(date) : null)}
      modifiers={{ hasSession: sessionMatchers }}
      className="w-full bg-transparent"
      formatters={{
        formatWeekdayName: (date) =>
          date
            .toLocaleDateString("en-US", { weekday: "short" })
            .slice(0, 2)
      }}
      components={{
        DayButton: CustomDayButton,
        Chevron: ({ orientation, className }) =>
          orientation === "left" ? (
            <ChevronLeft className={className} />
          ) : (
            <ChevronRight className={className} />
          )
      }}
      classNames={{
        root: "w-full",
        months: "w-full",
        month: "w-full grid grid-cols-[2rem_1fr_2rem] items-center gap-y-3",
        month_caption: "col-start-2 flex items-center justify-center",
        caption_label: "text-content-primary font-semibold text-base",
        nav: "hidden",
        button_previous:
          "col-start-1 h-8 w-8 rounded-full text-content-primary hover:bg-surface-elevated transition-colors inline-flex items-center justify-center",
        button_next:
          "col-start-3 h-8 w-8 rounded-full text-content-primary hover:bg-surface-elevated transition-colors inline-flex items-center justify-center justify-self-end",
        chevron: "h-4 w-4",
        month_grid: "col-span-3 w-full border-collapse",
        weekdays: "flex justify-between",
        weekday:
          "w-10 text-center text-on-secondary-container text-xs uppercase tracking-wider font-medium",
        weeks: "mt-2 flex flex-col gap-1",
        week: "flex justify-between",
        day: "h-10 w-10 p-0 text-center text-sm",
        day_button:
          "h-10 w-10 rounded-full text-content-secondary transition-colors aria-disabled:cursor-default",
        today: "text-content-primary border border-accent/40",
        selected: "bg-accent text-accent-on",
        outside: "opacity-20 text-content-secondary",
        disabled: "opacity-30",
        hidden: "invisible"
      }}
    />
  );
}
