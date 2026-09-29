"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase, PHOTO_BUCKET } from "@/lib/supabaseClient";
import { resizeImage } from "@/lib/resizeImage";
import AttendeeRow from "@/components/AttendeeRow";
import AddAttendeeForm from "@/components/AddAttendeeForm";

const EVENTS = [
  { key: "liaison_lunch", label: "Liaison lunch" },
  { key: "speed_mentoring", label: "Speed mentoring" },
];

export default function Dashboard() {
  const [physicians, setPhysicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [event, setEvent] = useState("liaison_lunch");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("physicians")
        .select("*")
        .order("name", { ascending: true });

      if (cancelled) return;

      if (error) {
        setErrorMsg(
          "Couldn't reach Supabase. Check that .env.local has your project URL and anon key, and that supabase/schema.sql has been run."
        );
      } else {
        setPhysicians(data ?? []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("physicians-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "physicians" },
        (payload) => {
          setPhysicians((current) => {
            if (payload.eventType === "INSERT") {
              if (current.some((a) => a.id === payload.new.id)) return current;
              return [...current, payload.new];
            }
            if (payload.eventType === "UPDATE") {
              return current.map((a) =>
                a.id === payload.new.id ? payload.new : a
              );
            }
            if (payload.eventType === "DELETE") {
              return current.filter((a) => a.id !== payload.old.id);
            }
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleCheckIn = useCallback(async (physician) => {
    const nextValue = !physician.checked_in;

    setPhysicians((current) =>
      current.map((a) =>
        a.id === physician.id ? { ...a, checked_in: nextValue } : a
      )
    );

    const { error } = await supabase
      .from("physicians")
      .update({ checked_in: nextValue })
      .eq("id", physician.id);

    if (error) {
      setPhysicians((current) =>
        current.map((a) =>
          a.id === physician.id ? { ...a, checked_in: !nextValue } : a
        )
      );
      setErrorMsg("Check-in didn't save. Check your connection and try again.");
    }
  }, []);

  const toggleThankYouCard = useCallback(async (physician) => {
    const nextValue = !physician.thank_you_card_given;

    setPhysicians((current) =>
      current.map((a) =>
        a.id === physician.id ? { ...a, thank_you_card_given: nextValue } : a
      )
    );

    const { error } = await supabase
      .from("physicians")
      .update({ thank_you_card_given: nextValue })
      .eq("id", physician.id);

    if (error) {
      setPhysicians((current) =>
        current.map((a) =>
          a.id === physician.id
            ? { ...a, thank_you_card_given: !nextValue }
            : a
        )
      );
      setErrorMsg("That didn't save. Check your connection and try again.");
    }
  }, []);

  const updatePhoto = useCallback(async (physician, file) => {
    try {
      const blob = await resizeImage(file);
      const path = `${physician.id}-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, blob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);

      const { error } = await supabase
        .from("physicians")
        .update({ photo_url: data.publicUrl })
        .eq("id", physician.id);
      if (error) throw error;

      setPhysicians((current) =>
        current.map((a) =>
          a.id === physician.id ? { ...a, photo_url: data.publicUrl } : a
        )
      );
      return true;
    } catch {
      setErrorMsg("Photo didn't save. Check your connection and try again.");
      return false;
    }
  }, []);

  const updateDescriptor = useCallback(async (physician, text) => {
    const nextValue = text.trim() || null;
    const previous = physician.descriptor;

    setPhysicians((current) =>
      current.map((a) =>
        a.id === physician.id ? { ...a, descriptor: nextValue } : a
      )
    );

    const { error } = await supabase
      .from("physicians")
      .update({ descriptor: nextValue })
      .eq("id", physician.id);

    if (error) {
      setPhysicians((current) =>
        current.map((a) =>
          a.id === physician.id ? { ...a, descriptor: previous } : a
        )
      );
      setErrorMsg("Descriptor didn't save. Check your connection and try again.");
      return false;
    }
    return true;
  }, []);

  const addPhysician = useCallback(async (record) => {
    const { data, error } = await supabase
      .from("physicians")
      .insert(record)
      .select()
      .single();

    if (error) {
      setErrorMsg("Couldn't add that physician. Please try again.");
      return false;
    }

    setPhysicians((current) => {
      if (current.some((a) => a.id === data.id)) return current;
      return [...current, data];
    });
    return true;
  }, []);

  const filtered = useMemo(() => {
    let list = physicians.filter((a) => a.event_type === event);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((a) => {
        const haystack = [
          a.name,
          a.specialty,
          a.specialty_table,
          a.rotation_tables,
          a.designated_seat,
          a.descriptor,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    return list;
  }, [physicians, event, query]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ca = a.checked_in ? 1 : 0;
      const cb = b.checked_in ? 1 : 0;
      if (ca !== cb) return ca - cb;
      return a.name.localeCompare(b.name);
    });
  }, [filtered]);

  const eventList = physicians.filter((a) => a.event_type === event);
  const pendingCount = eventList.filter((a) => !a.checked_in).length;
  const checkedCount = eventList.length - pendingCount;
  const total = eventList.length || 1;
  const pct = Math.round((checkedCount / total) * 100);

  const firstCheckedInIndex = sorted.findIndex((a) => a.checked_in);

  return (
    <main className="min-h-screen mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
              Event Ops
            </p>
            <h1 className="font-display text-2xl font-semibold text-slate-50 sm:text-3xl">
              Check-In Desk
            </h1>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="shrink-0 rounded-lg bg-signal-go px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-panel transition hover:bg-signal-goDark focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-go focus-visible:ring-offset-2 focus-visible:ring-offset-console-bg"
          >
            + Add physician
          </button>
        </div>

        {/* Event toggle */}
        <div className="mt-5 flex gap-1 rounded-lg border border-console-line bg-console-panel p-1">
          {EVENTS.map((e) => (
            <button
              key={e.key}
              onClick={() => setEvent(e.key)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                event === e.key
                  ? "bg-ink-800 text-slate-50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>

        {/* Status console */}
        <div className="mt-4 rounded-xl border border-console-line bg-console-panel p-4 shadow-panel sm:p-5">
          <div className="flex items-end justify-between font-mono tabular">
            <div>
              <span className="text-2xl font-semibold text-signal-go sm:text-3xl">
                {checkedCount}
              </span>
              <span className="text-sm text-slate-500"> / {eventList.length} checked in</span>
            </div>
            <span className="text-sm text-slate-400">{pendingCount} pending</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
            <div
              className="h-full rounded-full bg-signal-go transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {errorMsg}
        </div>
      )}

      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search name, specialty, table, descriptor…"
          className="w-full rounded-lg border border-console-line bg-console-panel px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-go sm:w-96"
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-500">Loading roster…</div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-console-line py-16 text-center text-sm text-slate-500">
          No one here yet. Add a physician above.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((physician, idx) => (
            <li key={physician.id}>
              {idx === firstCheckedInIndex && idx !== 0 && (
                <div className="my-3 flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-slate-600">
                  <span className="h-px flex-1 bg-console-line" />
                  Checked in
                  <span className="h-px flex-1 bg-console-line" />
                </div>
              )}
              <AttendeeRow
                physician={physician}
                onCheckIn={toggleCheckIn}
                onToggleCard={toggleThankYouCard}
                onPhoto={updatePhoto}
                onDescriptor={updateDescriptor}
              />
            </li>
          ))}
        </ul>
      )}

      {formOpen && (
        <AddAttendeeForm
          defaultEvent={event}
          onClose={() => setFormOpen(false)}
          onSubmit={addPhysician}
        />
      )}
    </main>
  );
}
