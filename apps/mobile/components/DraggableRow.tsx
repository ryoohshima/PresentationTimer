import { type ComponentType, type ReactNode, type RefObject, useMemo } from "react";
import { Gesture, type PanGesture } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { type DragReorderController, targetIndexOf } from "../hooks/useDragReorder";

// 画面① アジェンダ編集の 1 行分ラッパー。ドラッグジェスチャーの生成と行の変位アニメーションを担う。
// Pan はハンドル要素にのみ付ける想定のため、gesture を render prop で子（AgendaItemRow）へ渡す。

const SHIFT_DURATION_MS = 150;

interface DraggableRowProps {
  index: number;
  itemId: string;
  controller: DragReorderController;
  children: (gesture: PanGesture) => ReactNode;
}

export function DraggableRow({ index, itemId, controller, children }: DraggableRowProps) {
  const {
    activeIndex,
    dragY,
    rowOffset,
    itemCount,
    scrollRef,
    handleDragStart,
    handleDrop,
    handleRelease,
  } = controller;

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          activeIndex.value = index;
          dragY.value = 0;
          runOnJS(handleDragStart)(itemId);
        })
        .onUpdate((event) => {
          dragY.value = event.translationY;
        })
        .onEnd(() => {
          const toIndex = targetIndexOf(index, dragY.value, rowOffset.value, itemCount);
          // 指を離した位置ではなく「並べ替え確定後の位置」へスナップさせ、store への反映が
          // 届くまで保持する。こうすると「旧順序 + transform あり」の見た目が
          // 「新順序 + transform なし」と一致し、切り替わりが視覚的に無変化になる。
          dragY.value = (toIndex - index) * rowOffset.value;
          runOnJS(handleDrop)(index, toIndex);
        })
        .onFinalize((_event, success) => {
          // キャンセル時（onEnd 未到達）のみ後始末。通常終了は handleDrop がリセット済み。
          if (!success) {
            runOnJS(handleRelease)();
          }
        })
        // ハンドルに触れた瞬間に ScrollView へタッチを奪われないようにする。
        // RNGH の型は RefObject<ComponentType | undefined> を要求するが実体はコンポーネント ref で足りるためキャストする。
        .blocksExternalGesture(scrollRef as unknown as RefObject<ComponentType | undefined>),
    [
      index,
      itemId,
      itemCount,
      activeIndex,
      dragY,
      rowOffset,
      scrollRef,
      handleDragStart,
      handleDrop,
      handleRelease,
    ],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const active = activeIndex.value;
    if (active === -1) {
      // アイドル復帰は並べ替え反映後のコミットでしか起きない（useDragReorder 参照）ため、
      // withTiming を挟まず即 0 に戻すのが正しい。アニメーションさせると二重移動になる。
      return { transform: [{ translateY: 0 }], zIndex: 0, elevation: 0 };
    }
    if (active === index) {
      return { transform: [{ translateY: dragY.value }], zIndex: 10, elevation: 10 };
    }
    // アクティブ行の現在の移動先に応じて、間に挟まれた行が 1 行分だけ避ける。
    const toIndex = targetIndexOf(active, dragY.value, rowOffset.value, itemCount);
    let shift = 0;
    if (active < index && index <= toIndex) {
      shift = -rowOffset.value;
    } else if (toIndex <= index && index < active) {
      shift = rowOffset.value;
    }
    return {
      transform: [{ translateY: withTiming(shift, { duration: SHIFT_DURATION_MS }) }],
      zIndex: 0,
      elevation: 0,
    };
  });

  return (
    <Animated.View style={animatedStyle} onLayout={controller.onRowLayout}>
      {children(gesture)}
    </Animated.View>
  );
}
