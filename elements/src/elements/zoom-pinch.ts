import { Zoompinch } from '@zoompinch/core';

export class ZoomPinchElement extends HTMLElement {
  private engine!: Zoompinch;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  get contentEl() {
    return this.shadowRoot!.querySelector('.content')! as HTMLElement;
  }
  get canvasElement() {
    return this.shadowRoot!.querySelector('.canvas')! as HTMLElement;
  }
  private connectedCallback() {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          touch-action: none;
        }
        .content {
          display: inline-block;
          will-change: transform;
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
        }
        .canvas {
          display: inline-block;
        }
        .matrix {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          width: 100%;
          height: 100%;
        }
      </style>
      <div class="content" style="touch-action: none;">
        <div class="canvas">
          <slot></slot>
         </div>
         <div class="matrix">
           <slot name="matrix"></slot>  
         </div>
      </div>
    `;

    const initialTranslateX = Number(this.getAttribute('translate-x') || '0');
    const initialTranslateY = Number(this.getAttribute('translate-y') || '0');
    const initialScale = Number(this.getAttribute('scale') || '1');
    const initialRotate = Number(this.getAttribute('rotate') || '0');
    const initialMinScale = Number(this.getAttribute('min-scale'));
    const initialMaxScale = Number(this.getAttribute('max-scale'));
    const initialOffsetTop = Number(this.getAttribute('offset-top'));
    const initialOffsetRight = Number(this.getAttribute('offset-right'));
    const initialOffsetBottom = Number(this.getAttribute('offset-bottom'));
    const initialOffsetLeft = Number(this.getAttribute('offset-left'));

    this.engine = new Zoompinch(
      this.contentEl,
      {
        top: !isNaN(initialOffsetTop) ? initialOffsetTop : 100,
        left: !isNaN(initialOffsetLeft) ? initialOffsetLeft : 0,
        right: !isNaN(initialOffsetRight) ? initialOffsetRight : 0,
        bottom: !isNaN(initialOffsetBottom) ? initialOffsetBottom : 0,
      },
      initialTranslateX,
      initialTranslateY,
      initialScale,
      initialRotate,
      !isNaN(initialMinScale) ? initialMinScale : undefined,
      !isNaN(initialMaxScale) ? initialMaxScale : undefined
    );

    this.contentEl.addEventListener('wheel', (e) => this.engine.handleWheel(e));
    this.contentEl.addEventListener('gesturestart', (e) => this.engine.handleGesturestart(e as any));
    window.addEventListener('gesturechange', (e) => this.engine.handleGesturechange(e as any));
    window.addEventListener('gestureend', (e) => this.engine.handleGestureend(e as any));

    this.contentEl.addEventListener('mousedown', (e) => this.engine.handleMousedown(e));
    window.addEventListener('mousemove', (e) => this.engine.handleMousemove(e));
    window.addEventListener('mouseup', (e) => this.engine.handleMouseup(e));

    this.contentEl.addEventListener('touchstart', (e) => this.engine.handleTouchstart(e));
    window.addEventListener('touchmove', (e) => this.engine.handleTouchmove(e));
    window.addEventListener('touchend', (e) => this.engine.handleTouchend(e));

    this.engine.addEventListener('update', () => {
      const translateX = this.engine.translateX.toString();
      const translateY = this.engine.translateY.toString();
      const scale = this.engine.scale.toString();
      const rotate = this.engine.rotate.toString();
      if (this.getAttribute('translate-x') !== translateX) {
        this.setAttribute('translate-x', translateX);
      }
      if (this.getAttribute('translate-y') !== translateY) {
        this.setAttribute('translate-y', translateY);
      }
      if (this.getAttribute('scale') !== scale) {
        this.setAttribute('scale', scale);
      }
      if (this.getAttribute('rotate') !== rotate) {
        this.setAttribute('rotate', rotate);
      }

      this.dispatchEvent(new Event('update'));
    });
  }
  private disconnectedCallback() {
    this.engine.destroy();
  }
  static observedAttributes = ['translate-x', 'translate-y', 'scale', 'rotate', 'min-scale', 'max-scale', 'offset-top', 'offset-right', 'offset-bottom', 'offset-left'];
  private attributeChangedCallback(name: string, _: string, value: string) {
    if (!this.engine) return;
    switch (name) {
      case 'translate-x':
        const translateX = Number(value);
        if (this.engine.translateX !== translateX) {
          this.engine.translateX = translateX;
          this.engine.update();
        }
        break;
      case 'translate-y':
        const translateY = Number(value);
        if (this.engine.translateY !== translateY) {
          this.engine.translateY = translateY;
          this.engine.update();
        }
        break;
      case 'scale':
        const scale = Number(value);
        if (this.engine.scale !== scale) {
          this.engine.scale = scale;
          this.engine.update();
        }
        break;
      case 'rotate':
        const rotate = Number(value);
        if (this.engine.rotate !== rotate) {
          this.engine.rotate = rotate;
          this.engine.update();
        }
        break;
      case 'min-scale':
        const minScale = Number(value);
        if (!isNaN(minScale) && this.engine.minScale !== minScale) {
          this.engine.minScale = minScale;
          this.engine.update();
        }
        break;
      case 'max-scale':
        const maxScale = Number(value);
        if (!isNaN(maxScale) && this.engine.maxScale !== maxScale) {
          this.engine.maxScale = maxScale;
          this.engine.update();
        }
        break;
      case 'offset-top':
      case 'offset-right':
      case 'offset-bottom':
      case 'offset-left':
        const offsetTop = Number(this.getAttribute('offset-top') || '0');
        const offsetRight = Number(this.getAttribute('offset-right') || '0');
        const offsetBottom = Number(this.getAttribute('offset-bottom') || '0');
        const offsetLeft = Number(this.getAttribute('offset-left') || '0');
        this.engine.offset = {
          top: offsetTop,
          right: offsetRight,
          bottom: offsetBottom,
          left: offsetLeft,
        };
        this.engine.update();
        break;
    }
  }
  public get canvasWidth() {
    return this.engine.canvasBounds.width;
  }
  public get canvasHeight() {
    return this.engine.canvasBounds.height;
  }
  public applyTransform(newScale: number, wrapperInnerCoords: [number, number], canvasAnchorCoords: [number, number]) {
    this.engine.applyTransform(newScale, wrapperInnerCoords, canvasAnchorCoords);
  }
  public normalizeClientCoords(clientX: number, clientY: number): [number, number] {
    return this.engine.normalizeClientCoords(clientX, clientY);
  }
  public composePoint(x: number, y: number) {
    return this.engine.composePoint(x, y);
  }
}
