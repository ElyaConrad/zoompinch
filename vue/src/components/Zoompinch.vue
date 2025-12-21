<template>
  <div ref="zoompinchRef" class="zoompinch" @wheel="handleWheel" @gesturestart="handleGesturestart" @mousedown="handleMousedown" @touchstart="handleTouchstart">
    <div class="canvas">
      <slot name="default" />
    </div>
    <div class="matrix">
      <slot v-if="ready && composePoint" name="matrix" :compose-point="composePoint" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Transform, Zoompinch } from '@zoompinch/core';
import { ref, toRef, computed, onMounted, watch, toRefs, onUnmounted, reactive, watchEffect } from 'vue';

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
  'update:transform': [transform: Transform];
  dragGestureStart: [event: MouseEvent | TouchEvent | WheelEvent];
  dragGestureEnd: [event: MouseEvent | TouchEvent | WheelEvent];
}>();

const zoompinchRef = ref<HTMLDivElement>();
const zoompinchEngine = ref<Zoompinch>();

const ready = ref(false);

(window as any).zoompinchEngine = zoompinchEngine;

const composePoint = ref<(x: number, y: number) => [number, number]>(() => {
  throw new Error('Not initialized yet');
});

onMounted(() => {
  if (!zoompinchRef.value) return;
  zoompinchEngine.value = new Zoompinch(zoompinchRef.value, props.offset, props.transform.translateX, props.transform.translateY, props.transform.scale, props.transform.rotate, props.minScale, props.maxScale);

  zoompinchEngine.value.addEventListener('update', () => {
    if (!zoompinchEngine.value) return;
    const newTransform = {
      translateX: zoompinchEngine.value.translateX,
      translateY: zoompinchEngine.value.translateY,
      scale: zoompinchEngine.value.scale,
      rotate: zoompinchEngine.value.rotate,
    };
    if (newTransform.translateX !== props.transform.translateX || newTransform.translateY !== props.transform.translateY || newTransform.scale !== props.transform.scale || newTransform.rotate !== props.transform.rotate) {
      emit('update:transform', newTransform);
    }

    composePoint.value = (x: number, y: number) => {
      return zoompinchEngine.value!.composePoint(x, y);
    };
  });
  zoompinchEngine.value.addEventListener('init', () => {
    ready.value = true;
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
  },
  { deep: true }
);
watch(
  () => props.offset,
  (newOffset) => {
    if (!zoompinchEngine.value) return;
    zoompinchEngine.value.offset = newOffset;
    zoompinchEngine.value.update();
  },
  { deep: true }
);
watch(
  () => props.minScale,
  (newMinScale) => {
    if (!zoompinchEngine.value) return;
    zoompinchEngine.value.minScale = newMinScale;
    zoompinchEngine.value.update();
  }
);
watch(
  () => props.maxScale,
  (newMaxScale) => {
    if (!zoompinchEngine.value) return;
    zoompinchEngine.value.maxScale = newMaxScale;
    zoompinchEngine.value.update();
  }
);

const applyTransform = (scale: number, wrapperInnerCoords: [number, number], canvasCoords: [number, number], rotate?: number) => {
  if (!zoompinchEngine.value) return;
  if (rotate !== undefined) {
    zoompinchEngine.value.rotate = rotate;
  }
  zoompinchEngine.value.applyTransform(scale, wrapperInnerCoords, canvasCoords);
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

window.addEventListener('gesturechange', handleGesturechange);
window.addEventListener('gestureend', handleGestureend);
window.addEventListener('mousemove', handleMousemove);
window.addEventListener('mouseup', handleMouseup);
window.addEventListener('touchmove', handleTouchmove);
window.addEventListener('touchend', handleTouchend);
onUnmounted(() => {
  window.removeEventListener('gesturechange', handleGesturechange);
  window.removeEventListener('gestureend', handleGestureend);
  window.removeEventListener('mousemove', handleMousemove);
  window.removeEventListener('mouseup', handleMouseup);
  window.removeEventListener('touchmove', handleTouchmove);
  window.removeEventListener('touchend', handleTouchend);
});

const normalizeClientCoords = (clientX: number, clientY: number) => {
  if (!zoompinchEngine.value) {
    throw new Error('Zoompinch engine not initialized');
  }
  return zoompinchEngine.value.normalizeClientCoords(clientX, clientY);
};
defineExpose({
  applyTransform,
  composePoint,
  normalizeClientCoords,
  zoompinchEngine,
});
</script>

<style scoped lang="css">
.zoompinch {
  touch-action: none;
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
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
