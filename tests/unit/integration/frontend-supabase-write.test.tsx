import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createClient } from "@supabase/supabase-js";
import React, { useState } from "react";

function SolarEventsWriteButton() {
  const [status, setStatus] = useState("idle");

  const handleWrite = async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const isLocal = /localhost|127\.0\.0\.1/.test(url);

    if (!url || !anonKey || !isLocal) {
      setStatus("skipped");
      return;
    }

    const supabase = createClient(url, anonKey);
    const now = new Date();
    const weekStart = now.toISOString().slice(0, 10);
    const weekEnd = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: inserted, error: insertError } = await supabase
      .from("solar_events")
      .insert({ week_start: weekStart, week_end: weekEnd, was_defended: false })
      .select("id")
      .single();

    if (insertError || !inserted) {
      throw insertError ?? new Error("Failed to insert solar event");
    }

    const { data: readBack, error: readError } = await supabase
      .from("solar_events")
      .select("id")
      .eq("id", inserted.id)
      .single();

    if (readError || !readBack) {
      throw readError ?? new Error("Inserted solar event was not readable");
    }

    const { error: deleteError } = await supabase.from("solar_events").delete().eq("id", inserted.id);
    if (deleteError) {
      throw deleteError;
    }

    setStatus(`inserted:${inserted.id}`);
  };

  return (
    <div>
      <button onClick={handleWrite} type="button">
        Create Solar Event
      </button>
      <p data-testid="write-status">{status}</p>
    </div>
  );
}

describe("Frontend Supabase write flow", () => {
  const hasLocalDbEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    /localhost|127\.0\.0\.1/.test(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");

  (hasLocalDbEnv ? it : it.skip)(
    "writes to local Supabase via frontend interaction and confirms the row exists",
    async () => {
      render(<SolarEventsWriteButton />);
      fireEvent.click(screen.getByRole("button", { name: "Create Solar Event" }));

      await waitFor(() => {
        const status = screen.getByTestId("write-status").textContent ?? "";
        expect(status.startsWith("inserted:")).toBe(true);
      });
    },
  );
});
