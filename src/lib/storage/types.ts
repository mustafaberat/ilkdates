import type { EventInput, EventRecord } from "@/lib/events";

export type SessionUser = {
  id: string;
  username: string;
};

export type EventStore = {
  list(): Promise<EventRecord[]>;
  create(input: EventInput): Promise<EventRecord>;
  update(id: string, input: EventInput): Promise<EventRecord>;
  remove(id: string): Promise<void>;
};
