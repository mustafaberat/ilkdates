import { describe, expect, it } from "vitest";

import { headerAuthState } from "@/lib/domain/header-auth";
import type { SessionUser } from "@/lib/domain/profile";

const member: SessionUser = {
  id: "11111111-1111-4111-8111-111111111111",
  username: "elifmert",
};

describe("headerAuthState", () => {
  it("shows member links on first paint when the server already knows the user", () => {
    expect(headerAuthState(member, false, member)).toBe("member");
    expect(headerAuthState(null, false, member)).toBe("member");
  });

  it("shows guest links when both the live and server session are empty", () => {
    expect(headerAuthState(null, false, null)).toBe("guest");
    expect(headerAuthState(null, true, null)).toBe("guest");
  });

  it("does not flash guest links after logout just because the server snapshot is stale", () => {
    expect(headerAuthState(null, true, member)).toBe("guest");
  });

  it("shows a neutral placeholder only when the session is truly unknown", () => {
    expect(headerAuthState(undefined, false, undefined)).toBe("unknown");
    expect(headerAuthState(undefined, true, undefined)).toBe("unknown");
  });
});
