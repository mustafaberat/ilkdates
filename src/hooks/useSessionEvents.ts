"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useInitialUser } from "@/components/SessionProvider";
import { todayInTimeZone } from "@/lib/dates";
import { sortEvents, type EventInput, type EventRecord } from "@/lib/events";
import {
  clearLocalEvents,
  localStore,
  peekLocalEvents,
  writeLocalEvents,
} from "@/lib/storage/local";
import {
  ApiError,
  deleteAccountRequest,
  fetchMe,
  logoutRequest,
  migrateLocalEvents,
  remoteStore,
  updateAccountRequest,
} from "@/lib/storage/remote";
import type { EventStore, SessionUser } from "@/lib/storage/types";

export type StoreMode = "local" | "remote";

export function useSessionEvents() {
  const initialUser = useInitialUser();
  const [user, setUser] = useState<SessionUser | null>(initialUser ?? null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [mode, setMode] = useState<StoreMode>(initialUser ? "remote" : "local");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => todayInTimeZone(), []);
  const store: EventStore = mode === "remote" ? remoteStore : localStore;

  const refresh = useCallback(async (next: EventStore) => {
    const list = await next.list();
    setEvents(sortEvents(list));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await fetchMe();
      if (cancelled) {
        return;
      }
      if (session) {
        setUser(session);
        setMode("remote");
        const local = peekLocalEvents();
        try {
          if (local.length > 0) {
            const { events: merged, imported } = await migrateLocalEvents(local);
            const serverIds = new Set(merged.map((event) => event.id));
            const leftover = local.filter((event) => !serverIds.has(event.id));
            if (leftover.length === 0) {
              clearLocalEvents();
            } else {
              writeLocalEvents(leftover);
            }
            setEvents(sortEvents(merged));
            if (imported > 0) {
              setNotice(`migrated:${imported}`);
            }
          } else {
            await refresh(remoteStore);
          }
        } catch {
          await refresh(remoteStore);
        }
      } else {
        setUser(null);
        setMode("local");
        setEvents(peekLocalEvents());
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const run = useCallback(async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : caught instanceof Error ? caught.message : "error_generic";
      setError(code);
      throw caught;
    } finally {
      setBusy(false);
    }
  }, []);

  const create = useCallback(
    async (input: EventInput) => {
      await run(async () => {
        const created = await store.create(input);
        setEvents((current) => sortEvents([...current, created]));
      });
    },
    [run, store],
  );

  const update = useCallback(
    async (id: string, input: EventInput) => {
      await run(async () => {
        const updated = await store.update(id, input);
        setEvents((current) =>
          sortEvents(current.map((event) => (event.id === id ? updated : event))),
        );
      });
    },
    [run, store],
  );

  const remove = useCallback(
    async (id: string) => {
      await run(async () => {
        await store.remove(id);
        setEvents((current) => current.filter((event) => event.id !== id));
      });
    },
    [run, store],
  );

  const logout = useCallback(async () => {
    await run(async () => {
      await logoutRequest();
      setUser(null);
      setMode("local");
      setEvents(peekLocalEvents());
    });
  }, [run]);

  const updateAccount = useCallback(
    async (input: {
      currentPassword: string;
      username?: string;
      newPassword?: string;
    }) => {
      await run(async () => {
        const next = await updateAccountRequest(input);
        setUser(next);
      });
    },
    [run],
  );

  const deleteAccount = useCallback(
    async (currentPassword: string) => {
      await run(async () => {
        await deleteAccountRequest(currentPassword);
        setUser(null);
        setMode("local");
        setEvents(peekLocalEvents());
      });
    },
    [run],
  );

  return {
    user,
    events,
    mode,
    ready,
    busy,
    notice,
    error,
    today,
    clearNotice: () => setNotice(null),
    clearError: () => setError(null),
    create,
    update,
    remove,
    logout,
    updateAccount,
    deleteAccount,
  };
}
