"use client";

import { useState } from "react";
import { supabase, PHOTO_BUCKET } from "@/lib/supabaseClient";

function emptyForm(defaultEvent) {
  return {
    event_type: defaultEvent,
    name: "",
    specialty: "",
    specialty_table: "",
    rotation_tables: "",
    designated_seat: "",
    descriptor: "",
  };
}

export default function AddAttendeeForm({ defaultEvent, onClose, onSubmit }) {
  const [form, setForm] = useState(() => emptyForm(defaultEvent));
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isLiaison = form.event_type === "liaison_lunch";

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function uploadPhotoIfAny() {
    if (!photoFile) return null;
    const ext = photoFile.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, photoFile, { upsert: false });

    if (uploadError) {
      throw new Error("Photo upload failed: " + uploadError.message);
    }

    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    setSubmitting(true);

    try {
      const photo_url = await uploadPhotoIfAny();

      const record = isLiaison
        ? {
            event_type: "liaison_lunch",
            name: form.name.trim(),
            rotation_tables: form.rotation_tables.trim() || null,
            designated_seat: form.designated_seat.trim() || null,
            descriptor: form.descriptor.trim() || null,
            photo_url,
            checked_in: false,
            thank_you_card_given: false,
          }
        : {
            event_type: "speed_mentoring",
            name: form.name.trim(),
            specialty: form.specialty.trim() || null,
            specialty_table: form.specialty_table.trim() || null,
            descriptor: form.descriptor.trim() || null,
            photo_url,
            checked_in: false,
            thank_you_card_given: false,
          };

      const ok = await onSubmit(record);
      if (ok) {
        onClose();
      } else {
        setError("Something went wrong saving that physician. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-console-line bg-console-panel p-5 shadow-panel sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-50">
            Add physician
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-go"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-lg border border-console-line bg-ink-900 p-1">
          {[
            { key: "liaison_lunch", label: "Liaison lunch" },
            { key: "speed_mentoring", label: "Speed mentoring" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => update("event_type", t.key)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
                form.event_type === t.key
                  ? "bg-ink-800 text-slate-50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Name">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Dr.</span>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="input"
                placeholder="Full name"
                autoFocus
              />
            </div>
          </Field>

          {isLiaison ? (
            <>
              <Field label="Designated seat">
                <input
                  value={form.designated_seat}
                  onChange={(e) => update("designated_seat", e.target.value)}
                  className="input"
                  placeholder="e.g. Table 3, Seat 2"
                />
              </Field>
              <Field label="Rotation tables">
                <input
                  value={form.rotation_tables}
                  onChange={(e) => update("rotation_tables", e.target.value)}
                  className="input"
                  placeholder="e.g. Table 1, Table 3, Table 5"
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Specialty">
                <input
                  value={form.specialty}
                  onChange={(e) => update("specialty", e.target.value)}
                  className="input"
                  placeholder="e.g. Cardiology"
                />
              </Field>
              <Field label="Specialty table">
                <input
                  value={form.specialty_table}
                  onChange={(e) => update("specialty_table", e.target.value)}
                  className="input"
                  placeholder="e.g. Table 3"
                />
              </Field>
            </>
          )}

          <Field label="Descriptor (to identify them later)">
            <input
              value={form.descriptor}
              onChange={(e) => update("descriptor", e.target.value)}
              className="input"
              placeholder="e.g. tall, navy blazer, glasses"
            />
          </Field>

          <Field label="Photo (optional)">
            <div className="flex items-center gap-3">
              {photoPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="text-xs text-slate-400 file:mr-2 file:rounded-md file:border-0 file:bg-ink-800 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-slate-200"
              />
            </div>
          </Field>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-console-line py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-signal-go py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-signal-goDark disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Add physician"}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #22304a;
          background-color: #0b0f14;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #f1f5f9;
        }
        .input:focus {
          outline: none;
          box-shadow: 0 0 0 2px #2fd98a;
        }
        .input::placeholder {
          color: #64748b;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
