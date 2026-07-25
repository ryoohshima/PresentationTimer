import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, type LayoutChangeEvent } from "react-native";
import type { ScrollView } from "react-native-gesture-handler";
import { type SharedValue, useSharedValue } from "react-native-reanimated";

// 画面① アジェンダ編集のドラッグ並べ替え状態を 1 リスト分だけ管理するフック。
// UI スレッド側（shared value）と JS スレッド側（activeId / moveItem 呼び出し）の橋渡しを担い、
// 並び順の確定は既存の store `moveItem` に委譲する（このフック自身は配列を持たない）。
// 全行が同一高である前提（AgendaItemRow は固定レイアウト）。将来 multiline 化する場合は
// 行ごとの高さ測定に拡張が必要。

/** ドラッグ量から移動先 index を求める（リスト範囲へクランプ）。 */
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

interface UseDragReorderOptions {
  itemCount: number;
  /** ドロップ確定時（from !== to のときのみ）に JS スレッドで呼ばれる。 */
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export interface DragReorderController {
  /** ドラッグ中の行 index。-1 はアイドル。 */
  activeIndex: SharedValue<number>;
  /** アクティブ行の Y 方向ドラッグ量。 */
  dragY: SharedValue<number>;
  /** 行 1 つ分のオフセット（カード高 + 行間マージン。onLayout で測定）。 */
  rowOffset: SharedValue<number>;
  itemCount: number;
  /** ドラッグ中の行 id（ハイライト・scrollEnabled 制御用）。null はアイドル。 */
  activeId: string | null;
  scrollRef: React.RefObject<ScrollView | null>;
  handleDragStart: (id: string) => void;
  handleDrop: (fromIndex: number, toIndex: number) => void;
  handleRelease: () => void;
  onRowLayout: (event: LayoutChangeEvent) => void;
}

export function useDragReorder({
  itemCount,
  onReorder,
}: UseDragReorderOptions): DragReorderController {
  const activeIndex = useSharedValue(-1);
  const dragY = useSharedValue(0);
  const rowOffset = useSharedValue(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  // onReorder は毎レンダー新しい関数が渡っても安全なよう ref 経由で参照する。
  // レンダー中の ref 書き込みは React の純粋性原則に反するため、commit 後の effect で行う。
  const onReorderRef = useRef(onReorder);
  useEffect(() => {
    onReorderRef.current = onReorder;
  });

  const handleDragStart = useCallback((id: string) => {
    // キーボードが出たままだと画面高が変わり index 計算が狂うため閉じる（Web では no-op）。
    Keyboard.dismiss();
    setActiveId(id);
  }, []);

  // moveItem・shared value リセット・activeId 解除を同一 tick で行い、
  // 「並び替え後の自然位置」と「translateY 済みの表示位置」のズレによるちらつきを防ぐ。
  const handleDrop = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex !== toIndex) {
        onReorderRef.current(fromIndex, toIndex);
      }
      activeIndex.value = -1;
      dragY.value = 0;
      setActiveId(null);
    },
    [activeIndex, dragY],
  );

  /** ジェスチャーがキャンセルされた場合（onEnd 未到達）の後始末。 */
  const handleRelease = useCallback(() => {
    activeIndex.value = -1;
    dragY.value = 0;
    setActiveId(null);
  }, [activeIndex, dragY]);

  const onRowLayout = useCallback(
    (event: LayoutChangeEvent) => {
      // ラッパー View の高さは子カードの marginBottom を含むため、そのまま行オフセットになる。
      rowOffset.value = event.nativeEvent.layout.height;
    },
    [rowOffset],
  );

  return {
    activeIndex,
    dragY,
    rowOffset,
    itemCount,
    activeId,
    scrollRef,
    handleDragStart,
    handleDrop,
    handleRelease,
    onRowLayout,
  };
}
