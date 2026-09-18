// Offline support: connectivity flag + a small pending-write queue in localStorage.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const QUEUE_KEY = "av360.pendingWrites";

export interface PendingWrite {
  id: string;
  table: string;
  payload: Record<string, unknown>;
  queuedAt: number;
}

function readQueue(): PendingWrite[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as PendingWrite[];
  } catch {
    return [];
  }
}

function writeQueue(q: PendingWrite[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  window.dispatchEvent(new Event("av360:queue"));
}

export function enqueueWrite(table: string, payload: Record<string, unknown>) {
  const q = readQueue();
  q.push({ id: crypto.randomUUID(), table, payload, queuedAt: Date.now() });
  writeQueue(q);
}

export function getQueue() {
  return readQueue();
}

export function isOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

/** Attempts to push all queued writes. Returns the number of rows synced. */
export async function flushQueue(): Promise<number> {
  if (!isOnline()) return 0;
  const q = readQueue();
  if (q.length === 0) return 0;
  const remaining: PendingWrite[] = [];
  let synced = 0;
  for (const item of q) {
    const { error } = await supabase.from(item.table as never).insert(item.payload as never);
    if (error) remaining.push(item);
    else synced++;
  }
  writeQueue(remaining);
  return synced;
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

export function usePendingCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(readQueue().length);
    update();
    window.addEventListener("av360:queue", update);
    window.addEventListener("online", update);
    return () => {
      window.removeEventListener("av360:queue", update);
      window.removeEventListener("online", update);
    };
  }, []);
  return count;
}
