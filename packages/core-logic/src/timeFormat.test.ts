import { describe, expect, test } from "vitest";
import { formatMinSec } from "./timeFormat";

describe("formatMinSec", () => {
  test("0 秒は 00:00 になる", () => {
    expect(formatMinSec(0)).toBe("00:00");
  });

  test("分と秒がゼロ埋めされる", () => {
    expect(formatMinSec(65)).toBe("01:05");
    expect(formatMinSec(600)).toBe("10:00");
  });

  test("60 分以上は分がそのまま伸びる", () => {
    expect(formatMinSec(3661)).toBe("61:01");
  });

  test("負値は先頭に - を付ける（押し/巻き表示用）", () => {
    expect(formatMinSec(-90)).toBe("-01:30");
  });

  test("小数は切り捨てる", () => {
    expect(formatMinSec(59.9)).toBe("00:59");
  });
});
