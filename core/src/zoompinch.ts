import {
  clamp,
  degreeToRadians,
  rotatePoint,
  detectTrackpad,
  isMultipleOf,
  getUntransformedRect,
} from './helpers';

export type Offset = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};
export type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type Transform = {
  translateX: number;
  translateY: number;
  scale: number;
  rotate: number;
};

export class Zoompinch extends EventTarget {
  wrapperBounds!: Bounds;
  canvasBounds!: Bounds;

  constructor(
    public element: HTMLElement,
    public offset: Offset,
    public translateX: number,
    public translateY: number,
    public scale: number,
    public rotate: number,
    public minScale = 0.1,
    public maxScale = 10
  ) {
    super();

    const roElement = new ResizeObserver(() => {
      const { x, y, width, height } = this.element.getBoundingClientRect();
      this.wrapperBounds = { x, y, width, height };
      this.update();
    });
    const roCanvas = new ResizeObserver(() => {
      const { x, y, width, height } = getUntransformedRect(
        this.canvasElement.getBoundingClientRect(),
        this.renderingTranslateX,
        this.renderingTranslateY,
        this.renderinScale,
        this.renderingRotate
      );
      this.canvasBounds = { x, y, width, height };
      this.update();
    });

    requestAnimationFrame(() => {
      this.wrapperBounds = this.element.getBoundingClientRect();
      this.canvasBounds = this.canvasElement.getBoundingClientRect();
      this.update();
      this.dispatchEvent(new Event('init'));
    });

    roCanvas.observe(this.canvasElement);
    roElement.observe(this.element);

    console.log('INIT!');
    

  }
  get canvasElement() {
    return this.element.querySelector('.canvas')! as HTMLElement;
  }
  get wrapperInnerX() {
    return this.wrapperBounds.x + this.offset.left;
  }
  get wrapperInnerY() {
    return this.wrapperBounds.y + this.offset.top;
  }
  get wrapperInnerWidth() {
    return this.wrapperBounds.width - this.offset.left - this.offset.right;
  }
  get wrapperInnerHeight() {
    return this.wrapperBounds.height - this.offset.top - this.offset.bottom;
  }
  // Calculate the inner ratio
  get wrapperInnerRatio() {
    return this.wrapperInnerWidth / this.wrapperInnerHeight;
  }
  get canvasNaturalRatio() {
    return this.canvasBounds.width / this.canvasBounds.height;
  }
  // Get natural scale
  get naturalScale() {
    if (this.canvasNaturalRatio >= this.wrapperInnerRatio) {
      return this.wrapperInnerWidth / this.canvasBounds.width;
    } else {
      return this.wrapperInnerHeight / this.canvasBounds.height;
    }
  }
  private gestureStartRotate = 0;
  public handleGesturestart(event: UIEvent) {
    this.gestureStartRotate = this.rotate;
  }
  public handleGesturechange(event: UIEvent) {
    const { clientX, clientY } = event as any;
    const currRotation = (event as any).rotation as number;
    if (currRotation === 0) {
      return;
    }

    const relPos = this.normalizeMatrixCoordinates(clientX, clientY);
    this.rotateCanvas(relPos[0], relPos[1], this.gestureStartRotate + degreeToRadians(currRotation));
  }
  public handleGestureend(event: UIEvent) {
    //console.log('gestureend', event);
  }
  private dragStart: [number, number] | null = null;
  private dragStartFrozenX: number | null = null;
  private dragStartFrozenY: number | null = null;
  public handleMousedown(event: MouseEvent) {
    event.preventDefault();
    this.dragStart = [event.clientX, event.clientY];
    this.dragStartFrozenX = this.translateX;
    this.dragStartFrozenY = this.translateY;
  }
  public handleMouseup(event: MouseEvent) {
    event.preventDefault();
    this.dragStart = null;
    this.dragStartFrozenX = null;
    this.dragStartFrozenY = null;
  }
  public handleMousemove(event: MouseEvent) {
    event.preventDefault();

    if (this.dragStart && this.dragStartFrozenX !== null && this.dragStartFrozenY !== null) {
      const deltaX = event.clientX - this.dragStart[0];
      const deltaY = event.clientY - this.dragStart[1];
      const x = this.dragStartFrozenX - -deltaX;
      const y = this.dragStartFrozenY - -deltaY;
      this.translateX = x;
      this.translateY = y;
      this.update();
    }
  }
  public handleWheel(event: WheelEvent) {
    let { deltaX, deltaY, ctrlKey } = event;
    const mouseMultiples = [120, 100];
    const mouseFactor = ctrlKey ? 2 : 2;
    if (!detectTrackpad(event)) {
      if (Math.abs(deltaX) === 120 || Math.abs(deltaX) === 200) {
        deltaX = (deltaX / ((100 / mouseFactor) * isMultipleOf(deltaX, mouseMultiples))) * Math.sign(deltaX);
      }
      if (Math.abs(deltaY) === 120 || Math.abs(deltaY) === 200) {
        deltaY = (deltaY / ((100 / mouseFactor) * isMultipleOf(deltaY, mouseMultiples))) * Math.sign(deltaY);
      }
    }
    const currScale = this.scale;
    if (ctrlKey) {
      const scaleDelta = (-deltaY / 100) * currScale;
      const newScale = clamp(currScale + scaleDelta, this.minScale, this.maxScale);

      const coords = this.relativeWrapperCoordinatesFromClientCoords(event.clientX, event.clientY);

      const [translateX, translateY] = this.calcProjectionTranslate(
        newScale,
        coords,
        this.normalizeMatrixCoordinates(event.clientX, event.clientY)
      );

      this.translateX = translateX;
      this.translateY = translateY;
      this.scale = newScale;
    } else {
      this.translateX = this.translateX - deltaX;
      this.translateY = this.translateY - deltaY;
    }
    this.update();
    event.preventDefault();
  }
  private touchStarts: { client: [number, number]; canvasRel: [number, number] }[] | null = null;
  private touchStartTranslateX = 0;
  private touchStartTranslateY = 0;
  freezeTouches(touches: TouchList) {
    return Array.from(touches).map((touch) => {
      const wrapperCoords = this.clientCoordsToWrapperCoords(touch.clientX, touch.clientY);
      return {
        client: [touch.clientX, touch.clientY] as [number, number],
        canvasRel: this.getCanvasCoordsRel(wrapperCoords[0], wrapperCoords[1]),
      };
    });
  }
  public handleTouchstart(event: TouchEvent) {
    this.touchStarts = this.freezeTouches(event.touches);
    this.touchStartTranslateX = this.translateX;
    this.touchStartTranslateY = this.translateY;

    event.preventDefault();
  }
  public handleTouchmove(event: TouchEvent) {
    event.preventDefault(); // Prevent default touch behavior
    // Make the touch positions become relative to the inner wrapper
    const touchPositions = Array.from(event.touches).map((touch) =>
      this.clientCoordsToWrapperCoords(touch.clientX, touch.clientY)
    );

    if (this.touchStarts) {
      if (touchPositions.length >= 2 && this.touchStarts.length >= 2) {
        // Multi finger touch implementation
        // We're calculating:
        // 1. The scale projection and scale relied delta
        // 2. The rotation projection and rotation delta

        // SCALE

        // Calculate the distance between the two fingers at the start
        const fingerOneStartCanvasCoords: [number, number] = [
          this.touchStarts[0].canvasRel[0] * this.canvasBounds.width,
          this.touchStarts[0].canvasRel[1] * this.canvasBounds.height,
        ];
        const fingerTwoStartCanvasCoords: [number, number] = [
          this.touchStarts[1].canvasRel[0] * this.canvasBounds.width,
          this.touchStarts[1].canvasRel[1] * this.canvasBounds.height,
        ];

        // This is the absolute distance between the two fingers at the start
        const fingerStartCanvasCoordsDelta = Math.sqrt(
          Math.pow(fingerOneStartCanvasCoords[0] - fingerTwoStartCanvasCoords[0], 2) +
            Math.pow(fingerOneStartCanvasCoords[1] - fingerTwoStartCanvasCoords[1], 2)
        );
        // This is the absolute distance between the two fingers now
        const fingersNowDelta =
          Math.sqrt(
            Math.pow(touchPositions[0][0] - touchPositions[1][0], 2) + Math.pow(touchPositions[0][1] - touchPositions[1][1], 2)
          ) / this.naturalScale;
        // This is the future scale
        const futureScale = clamp(fingersNowDelta / fingerStartCanvasCoordsDelta, this.minScale, this.maxScale);
        // Justcalculate the relative coordinates of the inner wrapper and the canvas
        const innerWrapperRelPos: [number, number] = [
          touchPositions[0][0] / this.wrapperInnerWidth,
          touchPositions[0][1] / this.wrapperInnerHeight,
        ];
        const innerCanvasRel = this.touchStarts[0].canvasRel;
        // Project the scale
        const [scaleDeltaX, scaleDeltaY] = this.calcProjectionTranslate(futureScale, innerWrapperRelPos, innerCanvasRel, 0);
        let rotationDeltaX = 0;
        let rotationDeltaY = 0;
        let deltaAngle = 0;
        // ROTATION
        // Angle between the two fingers at the start
        const startAngle = Math.atan2(
          fingerTwoStartCanvasCoords[1] - fingerOneStartCanvasCoords[1],
          fingerTwoStartCanvasCoords[0] - fingerOneStartCanvasCoords[0]
        );
        // Angle between the first finger at the start and the second finger at the current position
        const newAngle = Math.atan2(touchPositions[1][1] - touchPositions[0][1], touchPositions[1][0] - touchPositions[0][0]);
        // Delta angle between the original angle the one that we're projecting
        deltaAngle = newAngle - startAngle;
        // This method will project a point on the canvas using the already known scale and its delta
        const projectPosScaled = (x: number, y: number): [number, number] => {
          return [
            this.offset.left + this.canvasBounds.width * x * this.naturalScale * futureScale + scaleDeltaX,
            this.offset.top + this.canvasBounds.height * y * this.naturalScale * futureScale + scaleDeltaY,
          ];
        };
        // Normal 0,0 position
        const originPointProjectionWithoutRotation = projectPosScaled(0, 0);
        // Anchor point
        const anchorPointProjectionWithoutRotation = projectPosScaled(
          this.touchStarts[0].canvasRel[0],
          this.touchStarts[0].canvasRel[1]
        );
        // Origin point with rotation
        const originPointProjectionWithRotation = rotatePoint(
          originPointProjectionWithoutRotation,
          anchorPointProjectionWithoutRotation,
          deltaAngle
        );
        // Calculate the difference between the original and the rotated point
        rotationDeltaX = originPointProjectionWithRotation[0] - originPointProjectionWithoutRotation[0];
        rotationDeltaY = originPointProjectionWithRotation[1] - originPointProjectionWithoutRotation[1];
        // Set the new values
        this.scale = futureScale;
        this.rotate = deltaAngle;
        this.translateX = scaleDeltaX + rotationDeltaX;
        this.translateY = scaleDeltaY + rotationDeltaY;
      } else {
        // Single finger touch implementation
        const deltaX = event.touches[0].clientX - this.touchStarts[0].client[0];
        const deltaY = event.touches[0].clientY - this.touchStarts[0].client[1];
        const futureTranslateX = this.touchStartTranslateX + deltaX;
        const futureTranslateY = this.touchStartTranslateY + deltaY;
        // Set the new values
        this.translateX = futureTranslateX;
        this.translateY = futureTranslateY;
      }

      this.update();
    }
  }
  public handleTouchend(event: TouchEvent) {
    if (event.touches.length === 0) {
      this.touchStarts = null;
    } else {
      this.touchStarts = this.freezeTouches(event.touches);
      this.touchStartTranslateX = this.translateX;
      this.touchStartTranslateY = this.translateY;
    }
  }
  private calcProjectionTranslate(
    newScale: number,
    wrapperPosition: [number, number],
    canvasPosition: [number, number],
    virtualRotate?: number
  ) {
    // Calculate the intrinsic dimensions of the canvas
    const canvasIntrinsicWidth = this.canvasBounds.width * this.naturalScale;
    const canvasIntrinsicHeight = this.canvasBounds.height * this.naturalScale;
    // Calculate the real x,y coordinates of the canvas
    const canvasRealX = canvasPosition[0] * canvasIntrinsicWidth * newScale;
    const canvasRealY = canvasPosition[1] * canvasIntrinsicHeight * newScale;

    const canvsRealRotated = rotatePoint([canvasRealX, canvasRealY], [0, 0], virtualRotate ?? this.rotate);
    // Calculate the real dimensions of the wrapper
    const wrapperRealX = wrapperPosition[0] * this.wrapperInnerWidth;
    const wrapperRealY = wrapperPosition[1] * this.wrapperInnerHeight;

    // Calculate the delta between the canvas and the wrapper
    const deltaX = wrapperRealX - canvsRealRotated[0];
    const deltaY = wrapperRealY - canvsRealRotated[1];

    return [deltaX, deltaY] as [number, number];
  }
  public applyTransform(newScale: number, wrapperInnerCoords: [number, number], canvasAnchorCoords: [number, number]) {
    console.log('....apply transform');
    
    const scaleTranslation = this.calcProjectionTranslate(newScale, wrapperInnerCoords, canvasAnchorCoords, 0);
    this.scale = newScale;
    this.translateX = scaleTranslation[0];
    this.translateY = scaleTranslation[1];
    this.update();
  }
  private composeRelPoint(
    x: number,
    y: number,
    currScale?: number,
    currTranslateX?: number,
    currTranslateY?: number,
    currRotate?: number
  ) {
    currScale = currScale ?? this.scale;
    currTranslateX = currTranslateX ?? this.translateX;
    currTranslateY = currTranslateY ?? this.translateY;
    currRotate = currRotate ?? this.rotate;

    // Anchor is 0, 0
    const anchor = [this.offset.left, this.offset.top] as [number, number];
    // Scale the point
    const scaledPoint = [
      this.offset.left + this.canvasBounds.width * (currScale * this.naturalScale) * x,
      this.offset.top + this.canvasBounds.height * (currScale * this.naturalScale) * y,
    ] as [number, number];
    // Rotate around the anchor
    const rotatedPoint = rotatePoint(scaledPoint, anchor, currRotate);
    // Translate straightforward
    const translatedPoint = [rotatedPoint[0] + currTranslateX, rotatedPoint[1] + currTranslateY] as [number, number];

    return translatedPoint;
  }

  public composePoint(x: number, y: number) {
    const relX = x / this.canvasBounds.width;
    const relY = y / this.canvasBounds.height;
    return this.composeRelPoint(relX, relY);
  }
  private getAnchorOffset(scale: number, translateX: number, translateY: number, rotate: number, anchor: [number, number] = [0.5, 0.5]) {
    const centeredTranslationOffset = this.calcProjectionTranslate(scale, anchor, anchor, 0);
    const centeredPointNormal = [
      this.offset.left + centeredTranslationOffset[0] + this.canvasBounds.width * (scale * this.naturalScale) * anchor[0],
      this.offset.top + centeredTranslationOffset[1] + this.canvasBounds.height * (scale * this.naturalScale) * anchor[1],
    ];
    const composedPoint = this.composeRelPoint(anchor[0], anchor[1], scale, translateX, translateY, rotate);

    const diffX = composedPoint[0] - centeredPointNormal[0];
    const diffY = composedPoint[1] - centeredPointNormal[1];

    return [diffX, diffY];
  }
  // Converts absolute inner wrapper coordinates to relative canvas coordinates (0-1, 0-1)
  private getCanvasCoordsRel(x: number, y: number) {
    // Anchor is relative wrapper inner 0,0
    const anchor = [0, 0] as [number, number];
    // Untranslate the point
    const untranslatedPoint = [x - this.translateX, y - this.translateY] as [number, number];
    // Unrotate the point
    const unrotatedPoint = rotatePoint(untranslatedPoint, anchor, -this.rotate);
    // Unscale the point
    const unscaledPoint = [unrotatedPoint[0] / this.renderinScale, unrotatedPoint[1] / this.renderinScale];
    // Return the point relative to the canvas natural size
    const pointRel = [unscaledPoint[0] / this.canvasBounds.width, unscaledPoint[1] / this.canvasBounds.height] as [
      number,
      number
    ];
    return pointRel;
  }
  // Converts absolute client to coordinates to absolute inner-wrapper coorinates
  private clientCoordsToWrapperCoords(clientX: number, clientY: number) {
    return [clientX - this.wrapperInnerX, clientY - this.wrapperInnerY] as [number, number];
  }
  // Converts absolute client coordinates to relative wrapper coordinates (0-1, 0-1)
  private relativeWrapperCoordinatesFromClientCoords(clientX: number, clientY: number) {
    const [x, y] = this.clientCoordsToWrapperCoords(clientX, clientY);
    return [x / this.wrapperInnerWidth, y / this.wrapperInnerHeight] as [number, number];
  }
  // Converts client coordinates to relative canvas coordinates (0-1, 0-1)
  private normalizeMatrixCoordinates(clientX: number, clientY: number) {
    const innerWrapperCoords = this.clientCoordsToWrapperCoords(clientX, clientY);
    return this.getCanvasCoordsRel(innerWrapperCoords[0], innerWrapperCoords[1]);
  }
  // Converts client coordinates to absolute canvas coordinates
  public normalizeClientCoords(clientX: number, clientY: number) {
    const [relX, relY] = this.normalizeMatrixCoordinates(clientX, clientY);
    return [relX * this.canvasBounds.width, relY * this.canvasBounds.height] as [number, number];
  }
  rotateCanvas(x: number, y: number, rotate: number) {
    const virtualPoint = this.composeRelPoint(x, y, this.scale, 0, 0, rotate);
    const currPoint = this.composeRelPoint(x, y);
    this.translateX = currPoint[0] - virtualPoint[0];
    this.translateY = currPoint[1] - virtualPoint[1];
    this.rotate = rotate;
    this.update();
  }

  get renderinScale() {
    return this.naturalScale * this.scale;
  }
  get renderingTranslateX() {
    return this.offset.left + this.translateX;
  }
  get renderingTranslateY() {
    return this.offset.top + this.translateY;
  }
  get renderingRotate() {
    return this.rotate;
  }
  update() {
    this.canvasElement.style.transformOrigin = 'top left';
    this.canvasElement.style.transform = `translateX(${this.renderingTranslateX}px) translateY(${this.renderingTranslateY}px) scale(${this.renderinScale}) rotate(${this.renderingRotate}rad)`;
    this.dispatchEvent(new Event('update'));
  }
  destroy() {
    // Cleanup here
  }
}
