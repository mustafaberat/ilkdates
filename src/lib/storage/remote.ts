import type { EventInput, EventRecord } from "@/lib/domain/events";
import type { EventStore, SessionUser } from "@/lib/storage/types";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, status: number) {
    super(code);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "same-origin",
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;
  if (!response.ok) {
    throw new ApiError(data.error ?? "error_generic", response.status);
  }
  return data;
}

export async function fetchMe(): Promise<SessionUser | null> {
  try {
    const data = await request<{ user: SessionUser | null }>("/api/auth/me");
    return data.user;
  } catch {
    return null;
  }
}

export async function loginRequest(
  username: string,
  password: string,
): Promise<SessionUser> {
  const data = await request<{ user: SessionUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return data.user;
}

export async function signupRequest(
  username: string,
  password: string,
): Promise<SessionUser> {
  const data = await request<{ user: SessionUser }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  await request("/api/auth/logout", { method: "POST" });
}

export async function updateAccountRequest(input: {
  currentPassword: string;
  username?: string;
  newPassword?: string;
}): Promise<SessionUser> {
  const data = await request<{ user: SessionUser }>("/api/auth/account", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.user;
}

export async function deleteAccountRequest(currentPassword: string): Promise<void> {
  await request("/api/auth/account", {
    method: "DELETE",
    body: JSON.stringify({ currentPassword }),
  });
}

export async function migrateLocalEvents(
  events: EventRecord[],
): Promise<{ events: EventRecord[]; imported: number }> {
  return request<{ events: EventRecord[]; imported: number }>("/api/events/migrate", {
    method: "POST",
    body: JSON.stringify({ events }),
  });
}

export const remoteStore: EventStore = {
  async list() {
    const data = await request<{ events: EventRecord[] }>("/api/events");
    return data.events;
  },
  async create(input: EventInput) {
    const data = await request<{ event: EventRecord }>("/api/events", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data.event;
  },
  async update(id, input) {
    const data = await request<{ event: EventRecord }>(`/api/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return data.event;
  },
  async remove(id) {
    await request(`/api/events/${id}`, { method: "DELETE" });
  },
};
