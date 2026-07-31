import { type ComponentType, type ReactNode, type RefObject, useMemo } from "react";
import { StyleSheet } from "react-native";
import { Gesture, type PanGesture } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { type DragReorderController, movedSlots, targetIndexOf } from "../hooks/useDragReorder";

// 画面① アジェンダ編集の 1 行分ラッパー。ドラッグジェスチャーの生成と行の配置を担う。
// 行高（rowOffset）の測定後は absolute 配置となり、表示位置は slots（UI スレッド所有）の
// translateY だけが決める。store の並び替え commit はレイアウトへ影響しないため、
// commit と transform 適用のフレームずれによるちらつきが起きない（issue #97 対策）。
// Pan はハンドル要素にのみ付ける想定のため、gesture を render prop で子（AgendaItemRow）へ渡す。

const SHIFT_DURATION_MS = 150;

interface DraggableRowProps {
  /** agenda 配列上の現在 index。slots 未登録の間（追加直後の初回描画）のフォールバック。 */
  agendaIndex: number;
  itemId: string;
  controller: DragReorderController;
  children: (gesture: PanGesture) => ReactNode;
}

export function DraggableRow({ agendaIndex, itemId, controller, children }: DraggableRowProps) {
  const {
    slots,
    draggingId,
    grabbedSlot,
    dragY,
    settling,
    rowOffset,
    itemCount,
    listHeight,
    scrollRef,
    handleDragStart,
    handleDrop,
    handleRelease,
  } = controller;

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          grabbedSlot.value = slots.value[itemId] ?? agendaIndex;
          dragY.value = 0;
          draggingId.value = itemId;
          runOnJS(handleDragStart)(itemId);
        })
        .onUpdate((event) => {
          dragY.value = event.translationY;
          // ホバー先のスロットへ slots を即時並べ替える（他行は withTiming で避ける）。
          const hover = targetIndexOf(
            grabbedSlot.value,
            event.translationY,
            rowOffset.value,
            itemCount,
          );
          if (slots.value[itemId] !== hover) {
            slots.value = movedSlots(slots.value, itemId, hover);
          }
        })
        .onEnd(() => {
          // 表示上の並びは onUpdate で slots に確定済み。draggingId を外すと transform が
          // 指追従からスロット位置への withTiming に切り替わり、そのまま着地アニメになる。
          const fromSlot = grabbedSlot.value;
          const toSlot = slots.value[itemId] ?? fromSlot;
          settling.value = true;
          draggingId.value = null;
          dragY.value = 0;
          runOnJS(handleDrop)(fromSlot, toSlot);
        })
        .onFinalize((_event, success) => {
          // キャンセル時（onEnd 未到達）のみ後始末。通常終了は onEnd が処理済み。
          if (!success) {
            runOnJS(handleRelease)();
          }
        })
        // ハンドルに触れた瞬間に ScrollView へタッチを奪われないようにする。
        // RNGH の型は RefObject<ComponentType | undefined> を要求するが実体はコンポーネント ref で足りるためキャストする。
        .blocksExternalGesture(scrollRef as unknown as RefObject<ComponentType | undefined>),
    [
      agendaIndex,
      itemId,
      itemCount,
      slots,
      draggingId,
      grabbedSlot,
      dragY,
      settling,
      rowOffset,
      scrollRef,
      handleDragStart,
      handleDrop,
      handleRelease,
    ],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const slot = slots.value[itemId] ?? agendaIndex;
    if (draggingId.value === itemId) {
      // ドラッグ中は開始時スロットを基準に指へ追従する。
      return {
        transform: [{ translateY: grabbedSlot.value * rowOffset.value + dragY.value }],
        zIndex: 10,
        elevation: 10,
      };
    }
    const restY = slot * rowOffset.value;
    if (draggingId.value !== null || settling.value) {
      // ドラッグセッション中の退避と、ドロップ直後の着地だけをアニメーションさせる。
      return {
        transform: [
          {
            translateY: withTiming(restY, { duration: SHIFT_DURATION_MS }, (finished) => {
              if (finished) {
                settling.value = false;
              }
            }),
          },
        ],
        zIndex: 0,
        elevation: 0,
      };
    }
    // アイドル時は即時反映。追加・削除・復元による位置替えをアニメーションさせない。
    return { transform: [{ translateY: restY }], zIndex: 0, elevation: 0 };
  });

  return (
    <Animated.View
      // 未測定の間は通常フローで描画して行高を測る。absolute への切り替えは同一 commit で
      // 初期 translateY（slot * rowOffset）ごと反映されるため、見た目は変化しない。
      style={listHeight === undefined ? undefined : [styles.absoluteRow, animatedStyle]}
      onLayout={controller.onRowLayout}
    >
      {children(gesture)}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  absoluteRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
