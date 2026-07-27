import { useTimerStore } from "@presentation-timer/store";
import type { AgendaItem } from "@presentation-timer/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

// アジェンダの端末ローカル永続化（Issue #19, docs/07: MVP はローカル保存のみ）。
// 起動時に AsyncStorage から復元し、以降は agenda の変更を保存する。

const STORAGE_KEY = "@presentation-timer/agenda:v1";

/** 保存データが AgendaItem として最低限の形を保っているか検証する。 */
function isAgendaItem(value: unknown): value is AgendaItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.plannedSec === "number" &&
    typeof item.allocatedSec === "number" &&
    typeof item.isLocked === "boolean"
  );
}

/**
 * 永続化の失敗を開発時のみ警告する。
 * 保存・復元の失敗はアプリ動作に影響させない方針だが、握り潰しは AsyncStorage 自体の
 * 故障（ネイティブ実装との不整合など）まで不可視にするため開発時は必ず可視化する。
 * 参照: Issue #96（SDK 非対応バージョンへの bump で永続化が無言で失敗した事例）。
 */
function warnPersistenceFailure(message: string, detail: unknown): void {
  if (__DEV__) {
    console.warn(`[useAgendaPersistence] ${message}`, detail);
  }
}

/**
 * TimerProvider 配下でマウントし、agenda を AsyncStorage と同期するフック。
 * 復元完了前は保存しない（起動直後の空配列で保存データを潰さないため）。
 */
export function useAgendaPersistence(): void {
  const { state, setAgenda } = useTimerStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled || raw === null) {
          return;
        }
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed) || !parsed.every(isAgendaItem)) {
          warnPersistenceFailure("保存データの形式が不正なため復元をスキップした", parsed);
          return;
        }
        // 空配列は全項目削除後の正常な保存結果であり、復元しても初期状態と等価なので何もしない
        if (parsed.length > 0) {
          setAgenda(parsed);
        }
      } catch (error) {
        // 壊れた保存データは捨てて空のアジェンダから始める
        warnPersistenceFailure("復元に失敗した", error);
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [setAgenda]);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.agenda)).catch((error: unknown) => {
      // 保存失敗は致命的でない（次の変更時に再試行される）
      warnPersistenceFailure("保存に失敗した", error);
    });
  }, [loaded, state.agenda]);
}
