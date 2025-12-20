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


export function detectTrackpad(event: WheelEvent) {
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