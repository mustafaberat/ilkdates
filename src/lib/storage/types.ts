import type { EventInput, EventRecord } from "@/lib/domain/events";
import type { SessionUser } from "@/lib/domain/profile";

export type { SessionUser };

export type EventStore = {
  list(): Promise<EventRecord[]>;
  create(input: EventInput): Promise<EventRecord>;
  update(id: string, input: EventInput): Promise<EventRecord>;
  remove(id: string): Promise<void>;
};
