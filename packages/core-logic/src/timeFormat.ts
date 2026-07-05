// 秒数と分:秒表記の変換ユーティリティ（純粋関数）。
// UI 層（apps/*）が plannedSec / 残り時間の表示・入力に使う（docs/06-screens.md）。

/**
 * 秒数を "MM:SS" 形式へ整形する。
 * 負値は先頭に "-" を付ける（押し/巻き表示用）。小数は切り捨てる。
 */
export function formatMinSec(totalSec: number): string {
  const sign = totalSec < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(totalSec));
  const min = Math.floor(abs / 60);
  const sec = abs % 60;
  return `${sign}${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
