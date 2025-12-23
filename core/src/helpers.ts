export function radiansToDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}
export function degreeToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getAngleBetweenTwoPoints(p1: [number, number], p2: [number, number]) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}

export function rotatePoint(point: [number, number], center: [number, number], angleInRadians: number): [number, number] {
  const [x, y] = point;
  const [cx, cy] = center;

  const rotatedX = Math.cos(angleInRadians) * (x - cx) - Math.sin(angleInRadians) * (y - cy) + cx;
  const rotatedY = Math.sin(angleInRadians) * (x - cx) + Math.cos(angleInRadians) * (y - cy) + cy;

  return [rotatedX, rotatedY];
}

export function angleToVector(angle: number): [number, number] {
  return [Math.cos(angle), Math.sin(angle)];
}
export function getVectorBetweenTwoPoints(p1: [number, number], p2: [number, number]): [number, number] {
  return [p2[0] - p1[0], p2[1] - p1[1]];
}
export function rotateVector(vector: [number, number], angle: number): [number, number] {
  const [x, y] = vector;
  return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)];
}

// Funktion, die von einem Startpunkt aus einen Vektor und eine Länge nimmt
// und sich nach der Länge auf dem Vektor bewegt und dann den Punkt ausgibt
export function moveAlongVector(startPoint: [number, number], vector: [number, number], length: number): [number, number] {
  const deltaX = vector[0] * length;
  const deltaY = vector[1] * length;
  return [startPoint[0] + deltaX, startPoint[1] + deltaY];
}

export function round(value: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function detectTrackpad(event: WheelEvent): boolean {
  if (event.ctrlKey) {
    const { deltaY, deltaMode, ctrlKey } = event;
    const absDeltaY = Math.abs(deltaY);

    const isMouseLikeDelta = absDeltaY === 120 || absDeltaY === 100 || absDeltaY === 3;

    const hasFractionalDelta = deltaY % 1 !== 0;

    const isPixelMode = deltaMode === 0;

    if (ctrlKey) {
      return (absDeltaY < 50 && isPixelMode) || hasFractionalDelta;
    }

    return !isMouseLikeDelta && (hasFractionalDelta || (isPixelMode && absDeltaY < 50));
  } else {
    var isTrackpad = false;
    if ((event as any).wheelDeltaY) {
      if ((event as any).wheelDeltaY === event.deltaY * -3) {
        isTrackpad = true;
      }
    } else if (event.deltaMode === 0) {
      isTrackpad = true;
    }
    return isTrackpad;
  }
}
export function normalizeWheelDelta(event: WheelEvent): { deltaX: number; deltaY: number } {
  let { deltaX, deltaY, deltaMode } = event;

  // Step 1: Convert to pixels based on deltaMode
  if (deltaMode === 1) {
    // Line mode
    deltaX *= 40;
    deltaY *= 40;
  } else if (deltaMode === 2) {
    // Page mode
    deltaX *= 800;
    deltaY *= 800;
  }

  // Step 2: Detect trackpad
  const isTrackpad = detectTrackpad(event);

  if (!isTrackpad) {
    // Step 3: For mouse wheels, apply adaptive scaling
    const absDeltaY = Math.abs(deltaY);
    const absDeltaX = Math.abs(deltaX);

    // Normalize mouse wheel values to a consistent range
    // Small values (0-10): likely Windows mouse with small increments
    // Large values (40+): likely macOS mouse
    if (absDeltaY < 10) {
      deltaY *= 5; // Amplify small Windows values
    } else if (absDeltaY > 30) {
      deltaY *= 0.5; // Reduce large macOS values
    }

    if (absDeltaX < 10) {
      deltaX *= 5;
    } else if (absDeltaX > 30) {
      deltaX *= 0.5;
    }
  }

  return { deltaX, deltaY };
}
// Simplified version
export function normalizeWheel(event: WheelEvent) {
  const PIXEL_STEP = 10;
  const LINE_HEIGHT = 40;
  const PAGE_HEIGHT = 800;

  let sX = 0, sY = 0, pX = 0, pY = 0;

  // Legacy
  if ('detail' in event) { sY = event.detail; }
  if ('wheelDelta' in event) { sY = -(event as any).wheelDelta / 120; }
  if ('wheelDeltaY' in event) { sY = -(event as any).wheelDeltaY / 120; }
  if ('wheelDeltaX' in event) { sX = -(event as any).wheelDeltaX / 120; }

  // Modern
  if ('deltaY' in event) { pY = event.deltaY; }
  if ('deltaX' in event) { pX = event.deltaX; }

  if ((pX || pY) && event.deltaMode) {
    if (event.deltaMode === 1) { // delta in LINE units
      pX *= LINE_HEIGHT;
      pY *= LINE_HEIGHT;
    } else { // delta in PAGE units
      pX *= PAGE_HEIGHT;
      pY *= PAGE_HEIGHT;
    }
  }

  // Fall-back if spin cannot be determined
  if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
  if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

  return {
    spinX: sX,
    spinY: sY,
    pixelX: pX,
    pixelY: pY
  };
}
export function isMultipleOf(n: number, multiples: number[]) {
  const factor = multiples.find((m) => n % m === 0);
  if (factor) {
    return n / factor;
  } else {
    return 1;
  }
}

export function getUntransformedRect(rect: DOMRect, tx: number, ty: number, scale: number, rotate: number) {
  // Inverse Translation
  let x = rect.left - tx;
  let y = rect.top - ty;

  // Inverse Rotation
  const cos = Math.cos(-rotate);
  const sin = Math.sin(-rotate);
  let xRot = x * cos - y * sin;
  let yRot = x * sin + y * cos;

  // Inverse Scale
  const width = rect.width / scale;
  const height = rect.height / scale;
  xRot /= scale;
  yRot /= scale;

  return { x: round(xRot, 4), y: round(yRot, 4), width: round(width, 4), height: round(height, 4) };
}
