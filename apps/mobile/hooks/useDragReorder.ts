import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Keyboard, type LayoutChangeEvent } from "react-native";
import type { ScrollView } from "react-native-gesture-handler";
import { type SharedValue, useSharedValue } from "react-native-reanimated";

// 画面① アジェンダ編集のドラッグ並べ替え状態を 1 リスト分だけ管理するフック。
//
// 【設計方針: 表示位置は UI スレッドが所有する（issue #97 の再発対策）】
// Reanimated 4 (Fabric) は transform 更新を ShadowTree::commit と同期しない高速パスで
// 適用するため、「store の並び替え commit と shared value リセットを同一フレームに載せる」
// 方式では、ネイティブで 1 フレームの不整合（旧順序 + transform 消失）を排除できない。
// 本実装では行を absolute 配置にし、表示位置を shared value `slots`（id → 表示スロット）
// だけで決める。moveItem の commit はレイアウトへ一切影響しないため、
// JS スレッドと UI スレッドの適用順序に依存する見た目が存在しない。
//
// 並び順の確定は既存の store `moveItem` に委譲する（このフック自身は配列を持たない）。
// 全行が同一高である前提（AgendaItemRow は固定レイアウト）。将来 multiline 化する場合は
// 行ごとの高さ測定に拡張が必要。

/** ドラッグ量から移動先スロットを求める（リスト範囲へクランプ）。 */
export function targetIndexOf(
  activeIndex: number,
  dragY: number,
  rowOffset: number,
  itemCount: number,
): number {
  "worklet";
  if (rowOffset <= 0) {
    return activeIndex;
  }
  const moved = activeIndex + Math.round(dragY / rowOffset);
  return Math.max(0, Math.min(itemCount - 1, moved));
}

/**
 * slots マップ上で id を toSlot へ移動した新しいマップを返す。
 * スロット値は常に 0..n-1 の連番である前提（このフックがその不変条件を維持する）。
 */
export function movedSlots(
  slots: Record<string, number>,
  id: string,
  toSlot: number,
): Record<string, number> {
  "worklet";
  const fromSlot = slots[id];
  if (fromSlot === undefined) {
    return slots;
  }
  const ids = Object.keys(slots).sort((a, b) => (slots[a] ?? 0) - (slots[b] ?? 0));
  ids.splice(fromSlot, 1);
  ids.splice(toSlot, 0, id);
  const next: Record<string, number> = {};
  ids.forEach((sortedId, slot) => {
    next[sortedId] = slot;
  });
  return next;
}

/** "\n" 連結の id 列から「agenda の並びどおり」の slots マップを作る。 */
function slotsFromKey(idsKey: string): Record<string, number> {
  const next: Record<string, number> = {};
  if (idsKey.length > 0) {
    idsKey.split("\n").forEach((id, slot) => {
      next[id] = slot;
    });
  }
  return next;
}

interface UseDragReorderOptions {
  /** agenda の並び順どおりの item id 列。 */
  agendaIds: string[];
  /** ドロップ確定時（from !== to のときのみ）に JS スレッドで呼ばれる。 */
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export interface DragReorderController {
  /** id → 表示スロット。表示位置の唯一の情報源（ドラッグ中は UI スレッドが書き換える）。 */
  slots: SharedValue<Record<string, number>>;
  /** ドラッグ中の行 id。null はアイドル（worklet 用）。 */
  draggingId: SharedValue<string | null>;
  /** ドラッグ開始時点のスロット（指追従の基準位置）。 */
  grabbedSlot: SharedValue<number>;
  /** アクティブ行の Y 方向ドラッグ量。 */
  dragY: SharedValue<number>;
  /** ドロップ後の着地アニメーション中は true（行側の withTiming 完了で false へ戻る）。 */
  settling: SharedValue<boolean>;
  /** 行 1 つ分のオフセット（カード高 + 行間マージン。onLayout で測定）。 */
  rowOffset: SharedValue<number>;
  itemCount: number;
  /** ドラッグ中の行 id（ハイライト・scrollEnabled 制御用）。null はアイドル。 */
  activeId: string | null;
  /** absolute 配置時のリスト全体の高さ。undefined は未測定（通常フローで描画する）。 */
  listHeight: number | undefined;
  scrollRef: React.RefObject<ScrollView | null>;
  handleDragStart: (id: string) => void;
  handleDrop: (fromSlot: number, toSlot: number) => void;
  handleRelease: () => void;
  onRowLayout: (event: LayoutChangeEvent) => void;
}

export function useDragReorder({
  agendaIds,
  onReorder,
}: UseDragReorderOptions): DragReorderController {
  const slots = useSharedValue<Record<string, number>>({});
  const draggingId = useSharedValue<string | null>(null);
  const grabbedSlot = useSharedValue(-1);
  const dragY = useSharedValue(0);
  const settling = useSharedValue(false);
  const rowOffset = useSharedValue(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  // absolute 配置への切り替えとリスト高さ算出のための JS 側ミラー。
  const [rowOffsetJs, setRowOffsetJs] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  // onReorder は毎レンダー新しい関数が渡っても安全なよう ref 経由で参照する。
  // レンダー中の ref 書き込みは React の純粋性原則に反するため、commit 後の effect で行う。
  const onReorderRef = useRef(onReorder);
  useEffect(() => {
    onReorderRef.current = onReorder;
  });

  // agenda 側の変更（追加・削除・moveItem・永続化からの復元）を slots へ反映する。
  // 自分のドロップの反映では slots が既に同じ内容のため同値書き込みとなり、見た目は変わらない。
  const idsKey = agendaIds.join("\n");
  useLayoutEffect(() => {
    slots.value = slotsFromKey(idsKey);
  }, [idsKey, slots]);

  const handleDragStart = useCallback((id: string) => {
    // キーボードが出たままだと画面高が変わり index 計算が狂うため閉じる（Web では no-op）。
    Keyboard.dismiss();
    setActiveId(id);
  }, []);

  // ドロップ時の表示位置は onEnd（UI スレッド）で確定済み。ここは store への反映のみを行い、
  // shared value には一切触れない（触れる必要のある状態を残さないのが本設計の要点）。
  const handleDrop = useCallback((fromSlot: number, toSlot: number) => {
    if (fromSlot !== toSlot) {
      onReorderRef.current(fromSlot, toSlot);
    }
    setActiveId(null);
  }, []);

  /** ジェスチャーがキャンセルされた場合（onEnd 未到達）の後始末。slots を agenda の並びへ戻す。 */
  const handleRelease = useCallback(() => {
    draggingId.value = null;
    dragY.value = 0;
    settling.value = true;
    slots.value = slotsFromKey(idsKey);
    setActiveId(null);
  }, [idsKey, draggingId, dragY, settling, slots]);

  const onRowLayout = useCallback(
    (event: LayoutChangeEvent) => {
      // ラッパー View の高さは子カードの marginBottom を含むため、そのまま行オフセットになる。
      const height = event.nativeEvent.layout.height;
      rowOffset.value = height;
      // 同値なら React が再レンダーを省くため、absolute 化後の onLayout 再発火は無害。
      setRowOffsetJs(height);
    },
    [rowOffset],
  );

  return {
    slots,
    draggingId,
    grabbedSlot,
    dragY,
    settling,
    rowOffset,
    itemCount: agendaIds.length,
    activeId,
    listHeight: rowOffsetJs > 0 ? agendaIds.length * rowOffsetJs : undefined,
    scrollRef,
    handleDragStart,
    handleDrop,
    handleRelease,
    onRowLayout,
  };
}
