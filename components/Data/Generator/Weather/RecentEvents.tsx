'use client';

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function EventList({ classificationId }: { classificationId: number }) {
  const supabase = useSupabaseClient();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("classification_location", classificationId)
        .order("time", { ascending: false });

      if (!error) setEvents(data || []);
    };

    fetchEvents();
  }, [classificationId]);

  if (!events.length) return null;

  return (
    <div className="mt-6 w-full max-w-xl mx-auto bg-[#1e1e2e] border border-[#44475a] rounded-lg shadow-md p-4 text-white font-mono">
      <h2 className="text-lg font-bold text-[#f8f8f2] mb-3">Recent Events</h2>
      <ul className="space-y-2">
        {events.map(event => (
          <li
            key={event.id}
            className="bg-[#282a36] border border-[#6272a4] rounded px-4 py-2 flex flex-col"
          >
            <span className="text-sm text-[#bd93f9]">{event.type}</span>
            <span className="text-xs text-[#f1fa8c]">
              {new Date(event.time).toLocaleString()}
            </span>
            {event.completed && (
              <span className="text-xs text-green-400 mt-1">✓ Completed</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};