import React, { useRef, useEffect, ReactNode, useState, forwardRef, useImperativeHandle } from 'react';
import { Zoompinch as ZoompinchCore, Transform } from '@zoompinch/core';
import './Zoompinch.css';

export interface ZoompinchRef {
  applyTransform: (
    scale: number, 
    wrapperInnerCoords: [number, number], 
    canvasCoords: [number, number], 
    rotate?: number
  ) => void;
  composePoint: (x: number, y: number) => [number, number];
  normalizeClientCoords: (clientX: number, clientY: number) => [number, number];
  rotateCanvas: (x: number, y: number, radians: number) => void;
  zoompinchEngine: ZoompinchCore | null;
  canvasWidth: number;
  canvasHeight: number;
}

export interface ZoompinchProps {
  style?: React.CSSProperties;
  transform?: Transform;
  onTransformChange?: (transform: Transform) => void;
  offset?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  maxScale?: number;
  minScale?: number;
  clampBounds?: boolean;
  rotation?: boolean;
  mouse?: boolean;
  wheel?: boolean;
  touch?: boolean;
  gesture?: boolean;
  children?: ReactNode;
  matrix?: ReactNode | ((props: { composePoint: (x: number, y: number) => [number, number]; normalizeClientCoords: (clientX: number, clientY: number) => [number, number]; canvasWidth: number; canvasHeight: number }) => ReactNode);
  onInit?: () => void;
  onClick?: (event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  onMouseup?: (event: React.MouseEvent) => void;
  onTouchend?: (event: React.TouchEvent) => void;
}

export const Zoompinch = forwardRef<ZoompinchRef, ZoompinchProps>(({
  transform = { translateX: 0, translateY: 0, scale: 1, rotate: 0 },
  offset = { left: 0, top: 0, right: 0, bottom: 0 },
  minScale = 0.5,
  maxScale = 10,
  clampBounds = false,
  rotation = true,
  mouse = true,
  wheel = true,
  touch = true,
  gesture = true,
  children,
  matrix,
  style,
  onTransformChange,
  onInit,
  onClick,
  onMouseDown,
  onTouchStart,
  onMouseup,
  onTouchend,
}, ref) => {
  const zoompinchRef = useRef<HTMLDivElement>(null);
  const zoompinchEngine = useRef<ZoompinchCore>(null);

  const ready = useRef(false);

  const [matrixData, setMatrixData] = useState({
    composePoint: (x: number, y: number): [number, number] => [0, 0],
    canvasWidth: 0,
    canvasHeight: 0,
  });

  const normalizeClientCoords = useRef<(clientX: number, clientY: number) => [number, number]>((clientX, clientY) => {
    if (zoompinchEngine.current) {
      return zoompinchEngine.current.normalizeClientCoords(clientX, clientY);
    }
    return [0, 0];
  });

  useImperativeHandle(ref, () => ({
      applyTransform: (scale, wrapperInnerCoords, canvasCoords, rotate) => {
        if (!zoompinchEngine.current) return;
        if (rotate !== undefined) {
          zoompinchEngine.current.rotate = rotate;
        }
        zoompinchEngine.current.applyTransform(scale, wrapperInnerCoords, canvasCoords);
      },
      composePoint: (x, y) => {
        if (matrixData.composePoint) {
          return matrixData.composePoint(x, y);
        }
        return [0, 0];
      },
      normalizeClientCoords: (clientX, clientY) => {
        if (normalizeClientCoords.current) {
          return normalizeClientCoords.current(clientX, clientY);
        }
        return [0, 0];
      },
      rotateCanvas: (x, y, radians) => {
        if (!zoompinchEngine.current) return;
        zoompinchEngine.current.rotateCanvas(x, y, radians);
      },
      zoompinchEngine: zoompinchEngine.current,
      canvasWidth: matrixData.canvasWidth,
      canvasHeight: matrixData.canvasHeight,
    }));

  function syncReactiveData() {
    if (!zoompinchEngine.current) return;
    setMatrixData({
      composePoint: zoompinchEngine.current!.composePoint.bind(zoompinchEngine.current),
      canvasWidth: zoompinchEngine.current!.canvasBounds?.width ?? 0,
      canvasHeight: zoompinchEngine.current!.canvasBounds?.height ?? 0,
    });
  }

  useEffect(() => {
    if (!zoompinchRef.current || zoompinchEngine.current) return;

    // Jetzt mit den Props initialisieren
    zoompinchEngine.current = new ZoompinchCore(zoompinchRef.current, offset, transform.translateX, transform.translateY, transform.scale, transform.rotate, minScale, maxScale, clampBounds, rotation);

    console.log('Zoompinch initialisiert mit Props!');

    zoompinchEngine.current.addEventListener('update', () => {
      if (!zoompinchEngine.current) return;
      const newTransform = {
        translateX: zoompinchEngine.current.translateX,
        translateY: zoompinchEngine.current.translateY,
        scale: zoompinchEngine.current.scale,
        rotate: zoompinchEngine.current.rotate,
      };

      if (onTransformChange && (newTransform.translateX !== transform.translateX || newTransform.translateY !== transform.translateY || newTransform.scale !== transform.scale || newTransform.rotate !== transform.rotate)) {
        onTransformChange(newTransform);
      }

      syncReactiveData();
    });
    zoompinchEngine.current.addEventListener('load', () => {
      if (!zoompinchEngine.current) return;
      ready.current = true;
      if (onInit) {
        onInit();
      }
      syncReactiveData();
    });
  }, []);

  // Make the function reactive
  // const composePoint = useRef<(x: number, y: number) => [number, number]>(null);
  // const normalizeClientCoords = useRef<(clientX: number, clientY: number) => [number, number]>((clientX: number, clientY: number) => {
  //   if (zoompinchEngine.current) {
  //     return zoompinchEngine.current.normalizeClientCoords(clientX, clientY);
  //   }
  //   return [0, 0];
  // });
  // const canvasWidth = useRef<number>(0);
  // const canvasHeight = useRef<number>(0);

  useEffect(() => {
    if (!zoompinchEngine.current || !ready.current) return;

    if (zoompinchEngine.current.translateX !== transform.translateX || zoompinchEngine.current.translateY !== transform.translateY || zoompinchEngine.current.scale !== transform.scale || zoompinchEngine.current.rotate !== transform.rotate) {
      zoompinchEngine.current.translateX = transform.translateX;
      zoompinchEngine.current.translateY = transform.translateY;
      zoompinchEngine.current.scale = transform.scale;
      zoompinchEngine.current.rotate = transform.rotate;

      zoompinchEngine.current.update();
    }
  }, [transform]);

  useEffect(() => {
    if (!zoompinchEngine.current || !ready.current) return;

    zoompinchEngine.current.offset = offset;
    zoompinchEngine.current.update();
  }, [offset]);

  useEffect(() => {
    if (!zoompinchEngine.current || !ready.current) return;

    zoompinchEngine.current.minScale = minScale;
    zoompinchEngine.current.update();
  }, [minScale]);

  useEffect(() => {
    if (!zoompinchEngine.current || !ready.current) return;

    zoompinchEngine.current.maxScale = maxScale;
    zoompinchEngine.current.update();
  }, [maxScale]);

  useEffect(() => {
    if (!zoompinchEngine.current || !ready.current) return;

    zoompinchEngine.current.clampBounds = clampBounds;

    zoompinchEngine.current.setTranslateFromUserGesture(zoompinchEngine.current.translateX, zoompinchEngine.current.translateY);
    zoompinchEngine.current.update();
  }, [clampBounds]);

  useEffect(() => {
    if (!zoompinchEngine.current || !ready.current) return;

    zoompinchEngine.current.rotation = rotation;
    zoompinchEngine.current.update();
  }, [rotation]);

  const handleWheel = (event: WheelEvent) => {
    if (!zoompinchEngine.current || !wheel) return;
    event.preventDefault();
    zoompinchEngine.current.handleWheel(event);
  };

  const handleGesturestart = (event: any) => {
    if (!zoompinchEngine.current || !gesture) return;
    zoompinchEngine.current.handleGesturestart(event);
  };

  const handleGesturechange = (event: any) => {
    if (!zoompinchEngine.current || !gesture) return;
    zoompinchEngine.current.handleGesturechange(event);
  };

  const handleGestureend = (event: any) => {
    if (!zoompinchEngine.current || !gesture) return;
    zoompinchEngine.current.handleGestureend(event);
  };

  const handleMousedown = (event: MouseEvent) => {
    if (!zoompinchEngine.current || !mouse) return;
    zoompinchEngine.current.handleMousedown(event);
  };

  const handleMousemove = (event: MouseEvent) => {
    if (!zoompinchEngine.current || !mouse) return;
    zoompinchEngine.current.handleMousemove(event);
  };

  const handleMouseup = (event: MouseEvent) => {
    if (!zoompinchEngine.current || !mouse) return;
    zoompinchEngine.current.handleMouseup(event);
  };

  const handleTouchstart = (event: TouchEvent) => {
    if (!zoompinchEngine.current || !touch) return;
    zoompinchEngine.current.handleTouchstart(event);
  };

  const handleTouchmove = (event: TouchEvent) => {
    if (!zoompinchEngine.current || !touch) return;
    zoompinchEngine.current.handleTouchmove(event);
  };

  const handleTouchend = (event: TouchEvent) => {
    if (!zoompinchEngine.current || !touch) return;
    zoompinchEngine.current.handleTouchend(event);
  };

  useEffect(() => {
    if (!zoompinchRef.current) return;
    const element = zoompinchRef.current;
    window.addEventListener('gesturechange', handleGesturechange);
    window.addEventListener('gestureend', handleGestureend);
    window.addEventListener('mousemove', handleMousemove);
    window.addEventListener('mouseup', handleMouseup);
    window.addEventListener('touchmove', handleTouchmove);
    window.addEventListener('touchend', handleTouchend);


    element.addEventListener('wheel', handleWheel, { passive: false })
    element.addEventListener('gesturestart', handleGesturestart, { passive: false });
    element.addEventListener('mousedown', handleMousedown, { passive: false });
    element.addEventListener('touchstart', handleTouchstart, { passive: false });

    return () => {
      window.removeEventListener('gesturechange', handleGesturechange);
      window.removeEventListener('gestureend', handleGestureend);
      window.removeEventListener('mousemove', handleMousemove);
      window.removeEventListener('mouseup', handleMouseup);
      window.removeEventListener('touchmove', handleTouchmove);
      window.removeEventListener('touchend', handleTouchend);
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('gesturestart', handleGesturestart);
      element.removeEventListener('mousedown', handleMousedown);
      element.removeEventListener('touchstart', handleTouchstart);
    };
  }, [mouse, touch, gesture, wheel]);

  return (
    <div
      ref={zoompinchRef}
      className="zoompinch"
      style={style}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onMouseUp={onMouseup}
      onTouchEnd={onTouchend}
    >
      <div className="canvas">{children}</div>
      <div className="matrix">
        {typeof matrix === 'function'
          ? matrix({
              composePoint: matrixData.composePoint,
              normalizeClientCoords: normalizeClientCoords.current,
              canvasWidth: matrixData.canvasWidth,
              canvasHeight: matrixData.canvasHeight,
            })
          : matrix}
      </div>
    </div>
  );
});

Zoompinch.displayName = 'Zoompinch';
