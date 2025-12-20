<template>
  <div
    ref="zoompinchRef"
    class="zoompinch"
    @wheel="handleWheel"
    @gesturestart="handleGesturestart"
    @mousedown="handleMousedown"
    @touchstart="handleTouchstart"
  >
    <div class="canvas">
      <slot name="default" />
    </div>
    <div class="matrix">
      <slot name="matrix" />
    </div>
  </div>
</template>

<script setup lang="ts">
// import { useZoom } from '../controllers/zoom';
import { Transform, Zoompinch } from "@zoompinch/core";
import {
  ref,
  toRef,
  computed,
  onMounted,
  watch,
  toRefs,
  onUnmounted,
  reactive,
} from "vue";

const props = withDefaults(
  defineProps<{
    transform?: Transform;
    offset?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    maxScale?: number;
    minScale?: number;
    bounds?: boolean;
    rotation?: boolean;
    mouse?: boolean;
    wheel?: boolean;
    touch?: boolean;
    gesture?: boolean;
  }>(),
  {
    transform: () => ({ translateX: 0, translateY: 0, scale: 1, rotate: 0 }),
    offset: () => ({ left: 0, top: 0, right: 0, bottom: 0 }),
    minScale: 0.5,
    maxScale: 10,
    bounds: false,
    rotation: true,
    mouse: true,
    wheel: true,
    touch: true,
    gesture: true,
  }
);
const emit = defineEmits<{
  "update:transform": [transform: Transform];
  dragGestureStart: [event: MouseEvent | TouchEvent | WheelEvent];
  dragGestureEnd: [event: MouseEvent | TouchEvent | WheelEvent];
}>();

const zoompinchRef = ref<HTMLDivElement>();
const zoompinchEngine = ref<Zoompinch>();

onMounted(() => {
  if (!zoompinchRef.value) return;
  zoompinchEngine.value = new Zoompinch(
    zoompinchRef.value,
    props.offset,
    props.transform.translateX,
    props.transform.translateY,
    props.transform.scale,
    props.transform.rotate,
    props.minScale,
    props.maxScale
  );

  zoompinchEngine.value.addEventListener("update", () => {
    if (!zoompinchEngine.value) return;
    const newTransform = {
      translateX: zoompinchEngine.value.translateX,
      translateY: zoompinchEngine.value.translateY,
      scale: zoompinchEngine.value.scale,
      rotate: zoompinchEngine.value.rotate,
    };
    if (
      newTransform.translateX !== props.transform.translateX ||
      newTransform.translateY !== props.transform.translateY ||
      newTransform.scale !== props.transform.scale ||
      newTransform.rotate !== props.transform.rotate
    ) {
      emit("update:transform", newTransform);
    }
  });
});

watch(
  () => props.transform,
  () => {
    if (!zoompinchEngine.value) return;
    if (
      zoompinchEngine.value.translateX !== props.transform.translateX ||
      zoompinchEngine.value.translateY !== props.transform.translateY ||
      zoompinchEngine.value.scale !== props.transform.scale ||
      zoompinchEngine.value.rotate !== props.transform.rotate
    ) {
      zoompinchEngine.value.translateX = props.transform.translateX;
      zoompinchEngine.value.translateY = props.transform.translateY;
      zoompinchEngine.value.scale = props.transform.scale;
      zoompinchEngine.value.rotate = props.transform.rotate;

      zoompinchEngine.value.update();
    }
  }
);

const applyTransform = (
  scale: number,
  wrapperInnerCoords: [number, number],
  canvasCoords: [number, number]
) => {
  zoompinchEngine.value?.applyTransform(
    scale,
    wrapperInnerCoords,
    canvasCoords
  );
};

const handleWheel = (event: WheelEvent) => {
  if (!zoompinchEngine.value) return;
  if (props.wheel) {
    zoompinchEngine.value.handleWheel(event);
  }
};
const handleGesturestart = (event: any) => {
  if (!zoompinchEngine.value) return;
  if (props.gesture) {
    zoompinchEngine.value.handleGesturestart(event);
  }
};
const handleGesturechange = (event: any) => {
  if (!zoompinchEngine.value) return;
  if (props.gesture) {
    zoompinchEngine.value.handleGesturechange(event);
  }
};
const handleGestureend = (event: any) => {
  if (!zoompinchEngine.value) return;
  if (props.gesture) {
    zoompinchEngine.value.handleGestureend(event);
  }
};
const handleMousedown = (event: MouseEvent) => {
  if (!zoompinchEngine.value) return;
  if (props.mouse) {
    zoompinchEngine.value.handleMousedown(event);
  }
};
const handleMousemove = (event: MouseEvent) => {
  if (!zoompinchEngine.value) return;
  if (props.mouse) {
    zoompinchEngine.value.handleMousemove(event);
  }
};
const handleMouseup = (event: MouseEvent) => {
  if (!zoompinchEngine.value) return;
  if (props.mouse) {
    zoompinchEngine.value.handleMouseup(event);
  }
};
const handleTouchstart = (event: TouchEvent) => {
  if (!zoompinchEngine.value) return;
  if (props.touch) {
    zoompinchEngine.value.handleTouchstart(event);
  }
};
const handleTouchmove = (event: TouchEvent) => {
  if (!zoompinchEngine.value) return;
  if (props.touch) {
    zoompinchEngine.value.handleTouchmove(event);
  }
};
const handleTouchend = (event: TouchEvent) => {
  if (!zoompinchEngine.value) return;
  if (props.touch) {
    zoompinchEngine.value.handleTouchend(event);
  }
};

window.addEventListener("gesturechange", handleGesturechange);
window.addEventListener("gestureend", handleGestureend);
window.addEventListener("mousemove", handleMousemove);
window.addEventListener("mouseup", handleMouseup);
window.addEventListener("touchmove", handleTouchmove);
window.addEventListener("touchend", handleTouchend);
onUnmounted(() => {
  window.removeEventListener("gesturechange", handleGesturechange);
  window.removeEventListener("gestureend", handleGestureend);
  window.removeEventListener("mousemove", handleMousemove);
  window.removeEventListener("mouseup", handleMouseup);
  window.removeEventListener("touchmove", handleTouchmove);
  window.removeEventListener("touchend", handleTouchend);
});

// console.log('!!!!!! ZOOMPINCH !!!!!!!', props);

// const zoompinchRef = ref<HTMLElement>();
// const canvasRef = ref<HTMLElement>();
// const matrixRef = ref<HTMLElement>();

// const canvasNaturalWidth = toRef(props, 'width');
// const canvasNaturalHeight = toRef(props, 'height');
// const offset = toRef(props, 'offset');

// const rotationEnabled = computed(() => {
//   return !props.bounds && props.rotation;
// });

// const {
//   renderingTranslate,
//   renderingRotate,
//   renderingScale,
//   composePoint,
//   handleWheel,
//   handleMousedown,
//   handleMousemove,
//   handleMouseup,
//   handleTouchstart,
//   handleTouchmove,
//   handleTouchend,
//   handleGesturestart,
//   handleGesturechange,
//   handleGestureend,
//   applyTransform,
//   rotateCanvas,
//   compose,
//   exposedTransform,
//   calcProjectionTranslate,
//   clientCoordinatesToCanvasCoordinates,
//   normalizeMatrixCoordinates,
//   transitionEnabled,
//   transitionDuration,
//   wrapperX,
//   wrapperY,
//   wrapperWidth,
//   wrapperHeight,
//   updateWrapperBounds
// } = useZoom({
//   wrapperElementRef: zoompinchRef,
//   canvasNaturalWidth,
//   canvasNaturalHeight,
//   offset,
//   bounds: toRef(props, 'bounds'),
//   rotationEnabled,
//   minScale: toRef(props, 'minScale'),
//   maxScale: toRef(props, 'maxScale'),
// });

// watch(exposedTransform, () => {
//   if (
//     props.transform.rotate !== exposedTransform.value.rotate ||
//     props.transform.scale !== exposedTransform.value.scale ||
//     props.transform.x !== exposedTransform.value.x ||
//     props.transform.y !== exposedTransform.value.y
//   ) {
//     emit('update:transform', exposedTransform.value);
//   }
// });

// watch(
//   () => props.transform,
//   () => {
//     exposedTransform.value = {
//       x: props.transform.x,
//       y: props.transform.y,
//       scale: props.transform.scale,
//       rotate: props.transform.rotate,
//     };
//   },
//   { deep: true }
// );
// onMounted(() => {
//   // exposedTransform.value = {
//   //   x: props.transform.x,
//   //   y: props.transform.y,
//   //   scale: props.transform.scale,
//   //   rotate: props.transform.rotate,
//   // };
// });

// const wheelGestures = WheelGestures();
// wheelGestures.on('wheel', (wheelEventState) => {
//   if (wheelEventState.isStart) {
//     emit('dragGestureStart', wheelEventState.event);
//   }
//   handleWheel(wheelEventState.event as any);
//   if (wheelEventState.isEnding) {
//     emit('dragGestureEnd', wheelEventState.event);
//   }
// });
// watch([zoompinchRef, () => props.wheel], () => {
//   if (zoompinchRef.value) {
//     if (props.wheel) {
//       wheelGestures.observe(zoompinchRef.value);
//     } else {
//       wheelGestures.disconnect();
//     }
//   }
// });
// onUnmounted(() => {
//   wheelGestures.disconnect();
// });

// const wheelProxy = (event: WheelEvent) => {
//   if (props.wheel) {
//     handleWheel(event);
//   }
// // };
// let touchmoveSinceTouchstart = false;
// let touchstartPoint: { x: number; y: number } | null = null;
// const touchmoveMinDistance = 10;
// const touchstartProxy = (event: TouchEvent) => {
//   touchmoveSinceTouchstart = false;
//   touchstartPoint = { x: event.touches[0].clientX, y: event.touches[0].clientY };
//   if (props.touch) {
//     emit('dragGestureStart', event);
//     handleTouchstart(event);
//   }
// };
// const touchmoveProxy = (event: TouchEvent) => {
//   if (
//     touchstartPoint &&
//     Math.sqrt(
//       Math.pow(event.touches[0].clientX - touchstartPoint.x, 2) + Math.pow(event.touches[0].clientY - touchstartPoint.y, 2)
//     ) > touchmoveMinDistance
//   ) {
//     touchmoveSinceTouchstart = true;
//   }
//   if (props.touch) {
//     handleTouchmove(event);
//   }
// };
// const touchendProxy = (event: TouchEvent) => {
//   if (props.touch) {
//     handleTouchend(event);
//     if (event.composedPath().includes(zoompinchRef.value!) && touchmoveSinceTouchstart) {
//       emit('dragGestureEnd', event);
//     }
//   }
// };
// let mousemoveSinceMousedown = false;
// let mousestartPoint: { x: number; y: number } | null = null;
// const mousemoveMinDistance = 10;
// const mousedownProxy = (event: MouseEvent) => {
//   mousemoveSinceMousedown = false;
//   mousestartPoint = { x: event.clientX, y: event.clientY };
//   if (props.mouse) {
//     emit('dragGestureStart', event);
//     handleMousedown(event);
//   }
// };
// const mousemoveProxy = (event: MouseEvent) => {
//   if (
//     mousestartPoint &&
//     Math.sqrt(Math.pow(event.clientX - mousestartPoint.x, 2) + Math.pow(event.clientY - mousestartPoint.y, 2)) >
//       mousemoveMinDistance
//   ) {
//     mousemoveSinceMousedown = true;
//   }
//   if (props.mouse) {
//     handleMousemove(event);
//   }
// };
// const mouseupProxy = (event: MouseEvent) => {
//   if (props.mouse) {
//     handleMouseup(event);
//     if (event.composedPath().includes(zoompinchRef.value!) && mousemoveSinceMousedown) {
//       emit('dragGestureEnd', event);
//     }
//   }
// };
// function isTouchDevice() {
//   return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
// }
// const gestureEnabled = computed(() => {
//   return !isTouchDevice() && props.gesture;
// });

// const gesturestartProxy = (event: any) => {
//   if (gestureEnabled.value) {
//     handleGesturestart(event);
//   }
// };
// const gesturechangeProxy = (event: any) => {
//   if (gestureEnabled.value) {
//     handleGesturechange(event);
//   }
// };
// const gestureendProxy = (event: any) => {
//   if (gestureEnabled.value) {
//     handleGestureend(event);
//   }
// };

// window.addEventListener('touchmove', touchmoveProxy);
// window.addEventListener('touchend', touchendProxy);
// window.addEventListener('mouseup', mouseupProxy);
// window.addEventListener('mousemove', mousemoveProxy);
// window.addEventListener('gesturechange', gesturechangeProxy);
// window.addEventListener('gestureend', gestureendProxy);
// onUnmounted(() => {
//   window.removeEventListener('touchmove', touchmoveProxy);
//   window.removeEventListener('touchend', touchendProxy);
//   window.removeEventListener('mouseup', mouseupProxy);
//   window.removeEventListener('mousemove', mousemoveProxy);
//   window.removeEventListener('gesturechange', gesturechangeProxy);
//   window.removeEventListener('gestureend', gestureendProxy);
// });

// const wrapperBounds = computed(() => {
//   return {
//     x: wrapperX.value,
//     y: wrapperY.value,
//     width: wrapperWidth.value,
//     height: wrapperHeight.value,
//   };
// });

// defineExpose({
//   compose,
//   composePoint,
//   clientCoordinatesToCanvasCoordinates,
//   normalizeMatrixCoordinates,
//   applyTransform,
//   calcProjectionTranslate,
//   rotateCanvas,
//   wrapperBounds,
//   canvas: canvasRef,
//   matrix: matrixRef,
//   updateWrapperBounds
// });
defineExpose({
  applyTransform,
});
</script>

<style scoped lang="css">
.zoompinch {
  touch-action: none;
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
  /* width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  touch-action: none;
  .canvas {
    position: absolute;
    left: 0px;
    top: 0px;
    width: var(--canvas-width);
    height: var(--canvas-height);
    transform-origin: 0% 0%;
    transform: translate(var(--translate-x), var(--translate-y)) scale(var(--rendering-scale)) rotate(var(--rotate));
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-drag: none;
    -webkit-user-drag: none;
    -moz-user-drag: none;
    ::v-deep(img) {
      pointer-events: none;
    }
  }
  &.transition-enabled {
    .canvas {
      transition: transform var(--transition-duration);
    }
  }

  .matrix {
    left: 0px;
    top: 0px;
    position: absolute;
    width: 100%;
    pointer-events: none;
    height: 100%;
    > ::v-deep(*) {
      width: 100%;
      height: 100%;
    }
    .offset-rect {
      position: absolute;
      background-color: rgba(255, 0, 0, 0.1);
      left: var(--offset-left);
      top: var(--offset-top);
      width: calc(100% - var(--offset-left) - var(--offset-right));
      height: calc(100% - var(--offset-top) - var(--offset-bottom));
    }
  } */
}
.zoompinch > .canvas {
  position: absolute;
}
.zoompinch > .matrix {
  pointer-events: none;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
