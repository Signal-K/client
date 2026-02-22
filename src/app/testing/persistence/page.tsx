"use client";

import { useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function TestingPersistencePage() {
  const [username, setUsername] = useState(`u${Date.now()}`);
  const [fullName, setFullName] = useState("Baseline");
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [lastAvatarUrl, setLastAvatarUrl] = useState("");

  const handleSubmit = async () => {
    setState("submitting");
    setMessage("");

    try {
      if (!file) {
        throw new Error("Please select a file");
      }

      const formData = new FormData();
      formData.set("file", file);
      formData.set("bucket", "uploads");
      formData.set("fileName", `e2e-${Date.now()}-${file.name}`);

      const uploadRes = await fetch("/api/gameplay/storage/upload", {
        method: "POST",
        body: formData,
      });
      const uploadJson = await uploadRes.json().catch(() => null);
      if (!uploadRes.ok || !uploadJson?.publicUrl) {
        throw new Error(uploadJson?.error || "Upload failed");
      }

      setLastAvatarUrl(String(uploadJson.publicUrl));

      const saveRes = await fetch("/api/gameplay/e2e/persistence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          fullName,
          avatarUrl: String(uploadJson.publicUrl),
        }),
      });
      const saveJson = await saveRes.json().catch(() => null);
      if (!saveRes.ok || !saveJson?.ok) {
        throw new Error(saveJson?.error || "Profile save failed");
      }

      setState("success");
      setMessage("Saved");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Testing Persistence</h1>
      <p className="text-sm text-muted-foreground">
        Internal test surface for validating frontend-driven Supabase persistence.
      </p>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Username</span>
        <input
          data-testid="persist-username"
          className="w-full rounded border px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Full Name</span>
        <input
          data-testid="persist-fullname"
          className="w-full rounded border px-3 py-2"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Upload File</span>
        <input
          data-testid="persist-file"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <button
        data-testid="persist-submit"
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        disabled={state === "submitting"}
        onClick={handleSubmit}
        type="button"
      >
        {state === "submitting" ? "Saving..." : "Save Persistence"}
      </button>

      <div data-testid="persist-state" className="text-sm">
        {state}
      </div>
      {message ? (
        <div data-testid="persist-message" className="text-sm">
          {message}
        </div>
      ) : null}
      {lastAvatarUrl ? (
        <div data-testid="persist-avatar-url" className="text-xs break-all">
          {lastAvatarUrl}
        </div>
      ) : null}
    </main>
  );
}
