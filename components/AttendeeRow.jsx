"use client";

export default function AttendeeRow({ physician, onCheckIn, onToggleCard }) {
  const checked = physician.checked_in;
  const isLiaison = physician.event_type === "liaison_lunch";

  const meta = isLiaison
    ? [
        physician.designated_seat && `Seat: ${physician.designated_seat}`,
        physician.rotation_tables && `Rotates: ${physician.rotation_tables}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : [physician.specialty, physician.specialty_table].filter(Boolean).join(" · ");

  const initials = physician.name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 transition-colors sm:px-5 sm:py-4 ${
        checked
          ? "border-console-line/70 bg-console-panel/50"
          : "border-console-line bg-console-panel shadow-panel"
      }`}
    >
      <div className="flex min-w-0 gap-3">
        {physician.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={physician.photo_url}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-800 font-mono text-sm font-semibold text-slate-400">
            {initials}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                isLiaison
                  ? "bg-signal-liaison/15 text-signal-liaison"
                  : "bg-signal-speed/15 text-signal-speed"
              }`}
            >
              {isLiaison ? "Liaison" : "Mentor"}
            </span>
            <h3
              className={`truncate font-medium ${
                checked ? "text-slate-400" : "text-slate-50"
              }`}
            >
              Dr. {physician.name}
            </h3>
          </div>
          <p className="mt-0.5 truncate text-sm text-slate-500">{meta || "—"}</p>
          {physician.descriptor && (
            <p className="mt-0.5 truncate text-xs italic text-slate-600">
              {physician.descriptor}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <button
          onClick={() => onCheckIn(physician)}
          aria-pressed={checked}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-console-bg ${
            checked
              ? "border border-console-line bg-transparent text-slate-500 hover:text-slate-300 focus-visible:ring-console-line"
              : "bg-signal-go text-ink-950 hover:bg-signal-goDark focus-visible:ring-signal-go"
          }`}
        >
          {checked ? "✓ Checked in" : "Check In"}
        </button>

        <button
          onClick={() => onToggleCard(physician)}
          aria-pressed={physician.thank_you_card_given}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-console-bg focus-visible:ring-signal-card ${
            physician.thank_you_card_given
              ? "bg-signal-card/15 text-signal-card"
              : "border border-console-line text-slate-500 hover:text-slate-300"
          }`}
        >
          {physician.thank_you_card_given ? "✓ Card given" : "Give card"}
        </button>
      </div>
    </div>
  );
}
