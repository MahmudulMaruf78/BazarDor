import { describe, expect, it } from "vitest";
import { MESSAGES, type MessageKey } from "@/lib/i18n/messages";

/** Latin tokens allowed in bn UI copy (IDs, brands, acronyms). */
const BN_LATIN_ALLOWLIST = new Set([
  "BazarDor",
  "BDT",
  "EN",
  "BN",
  "QR",
  "OTP",
  "SMS",
  "ID",
  "id",
  "npm",
  "run",
  "qa",
  "CSV",
  "PDF",
  "Excel",
  "IndexedDB",
  "JSON",
  "kg",
  "BBS",
  "OD",
  "UI",
  "URL",
  "API",
  "name",
  "count",
  "docs",
  "BANGLADESH",
  "LOCATIONS",
  "SOURCE",
  "md",
]);

const BN_LATIN_WORD = /\b[a-zA-Z]{2,}\b/g;

describe("bn catalog latin leak scan", () => {
  it("has no unexpected Latin words in MESSAGES.bn", () => {
    const hits: string[] = [];
    for (const key of Object.keys(MESSAGES.en) as MessageKey[]) {
      const value = MESSAGES.bn[key];
      if (!value.trim()) continue;
      const words = value.match(BN_LATIN_WORD) ?? [];
      for (const word of words) {
        if (BN_LATIN_ALLOWLIST.has(word)) continue;
        hits.push(`${key}: ${word}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
