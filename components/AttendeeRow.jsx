"use client";

import { useState } from "react";

export default function AttendeeRow({ physician, onCheckIn, onToggleCard, onPhoto, onDescriptor }) {
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function startEditing() {
    setDraft(physician.descriptor || "");
    setEditing(true);
  }

  async function saveDescriptor() {
    setEditing(false);
    if ((draft.trim() || null) === (physician.descriptor || null)) return;
    await onDescriptor(physician, draft);
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    await onPhoto(physician, file);
    setUploading(false);
  }

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
        <label
          className="group relative h-11 w-11 shrink-0 cursor-pointer rounded-full focus-within:ring-2 focus-within:ring-signal-go"
          title={physician.photo_url ? "Replace photo" : "Add photo"}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            disabled={uploading}
            className="sr-only"
            aria-label={`${physician.photo_url ? "Replace" : "Add"} photo for Dr. ${physician.name}`}
          />
          {physician.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={physician.photo_url}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-800 font-mono text-sm font-semibold text-slate-400">
              {initials}
            </div>
          )}
          <span
            className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-[10px] font-semibold text-slate-100 transition-opacity ${
              uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {uploading ? "…" : physician.photo_url ? "Change" : "+ Photo"}
          </span>
          {!physician.photo_url && !uploading && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-console-bg bg-signal-go text-[10px] font-bold leading-none text-ink-950">
              +
            </span>
          )}
        </label>

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
          {editing ? (
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={saveDescriptor}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") setEditing(false);
              }}
              autoFocus
              placeholder="e.g. tall, navy blazer, glasses"
              aria-label={`Descriptor for Dr. ${physician.name}`}
              className="mt-1 w-full max-w-xs rounded-md border border-console-line bg-ink-950 px-2 py-1 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-signal-go"
            />
          ) : (
            <button
              type="button"
              onClick={startEditing}
              title={physician.descriptor ? "Edit descriptor" : "Add descriptor"}
              className={`mt-0.5 block max-w-full truncate rounded text-left text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-go ${
                physician.descriptor
                  ? "italic text-slate-600 hover:text-slate-400"
                  : "text-slate-600 hover:text-signal-go"
              }`}
            >
              {physician.descriptor || "+ Add descriptor"}
            </button>
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
