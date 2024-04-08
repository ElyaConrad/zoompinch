import { Ref } from 'vue';
import { clamp } from './helpers';

export function useWheel({
  scale,
  translate,
  minScale,
  maxScale,
  relativeWrapperCoordinatesFromClientCoords,
  normalizeMatrixCoordinates,
  calcProjectionTranslate,
}: {
  scale: Ref<number>;
  translate: Ref<[number, number]>;
  minScale: Ref<number>;
  maxScale: Ref<number>;
  relativeWrapperCoordinatesFromClientCoords: (clientX: number, clientY: number) => [number, number];
  normalizeMatrixCoordinates: (clientX: number, clientY: number) => [number, number];
  calcProjectionTranslate: (
    newScale: number,
    wrapperPosition: [number, number],
    canvasPosition: [number, number]
  ) => [number, number];
}) {
  function handleWheel(event: WheelEvent) {
    const { deltaX, deltaY, ctrlKey } = event;
    const currScale = scale.value;
    if (ctrlKey) {
      const scaleDelta = (-deltaY / 100) * currScale;
      const newScale = clamp(currScale + scaleDelta, minScale.value, maxScale.value);

      const [translateX, translateY] = calcProjectionTranslate(
        newScale,
        relativeWrapperCoordinatesFromClientCoords(event.clientX, event.clientY),
        normalizeMatrixCoordinates(event.clientX, event.clientY)
      );

      translate.value = [translateX, translateY];
      scale.value = newScale;
    } else {
      translate.value = [translate.value[0] - deltaX, translate.value[1] - deltaY];
    }

    event.preventDefault();
    event.stopPropagation();
  }

  return {
    handleWheel,
  };
}