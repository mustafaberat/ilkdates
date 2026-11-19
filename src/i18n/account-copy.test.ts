import { describe, expect, it } from "vitest";

import { tr } from "@/i18n/tr";

describe("account close copy", () => {
  it("uses the approved danger-zone description", () => {
    expect(tr.closeAccountHint).toBe("Hesabın kalıcı olarak silinir. Bu işlem geri alınamaz.");
  });

  it("labels the action Hesabı sil", () => {
    expect(tr.closeAccountButton).toBe("Hesabı sil");
    expect(tr.closeAccount).toBe("Hesabı sil");
  });
});
