# @zoompinch/core

Core engine for pinch-to-zoom, pan and rotate experiences on any canvas-like content. Framework-agnostic JavaScript library.

**Play with the demo:** [https://zoompinch.pages.dev](https://zoompinch.pages.dev)

## Installation

```bash
npm install @zoompinch/core
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    #wrapper {
      width: 800px;
      height: 600px;
      border: 1px solid #ddd;
      touch-action: none;
      overflow: hidden;
      position: relative;
    }
    .canvas {
      display: inline-block;
      will-change: transform;
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
</head>
<body>
  <div id="wrapper">
    <div class="canvas">
      <img width="1536" height="2048" src="https://imagedelivery.net/mudX-CmAqIANL8bxoNCToA/489df5b2-38ce-46e7-32e0-d50170e8d800/public" />
    </div>
    <div class="matrix">
      <svg width="100%" height="100%">
        <circle id="centerMarker" r="8" fill="red" />
      </svg>
    </div>
  </div>

  <script type="module">
    import { Zoompinch } from '@zoompinch/core';

    const wrapper = document.getElementById('wrapper');
    
    // Initialize engine
    const engine = new Zoompinch(
      wrapper,
      { top: 0, left: 0, right: 0, bottom: 0 },  // offset
      0,      // translateX
      0,      // translateY
      1,      // scale
      0,      // rotate
      0.5,    // minScale
      4,      // maxScale
      false,  // clampBounds
      true    // rotation
    );

    // Set up event listeners
    wrapper.addEventListener('wheel', (e) => engine.handleWheel(e));
    wrapper.addEventListener('mousedown', (e) => engine.handleMousedown(e));
    window.addEventListener('mousemove', (e) => engine.handleMousemove(e));
    window.addEventListener('mouseup', (e) => engine.handleMouseup(e));

    wrapper.addEventListener('touchstart', (e) => engine.handleTouchstart(e));
    window.addEventListener('touchmove', (e) => engine.handleTouchmove(e));
    window.addEventListener('touchend', (e) => engine.handleTouchend(e));

    wrapper.addEventListener('gesturestart', (e) => engine.handleGesturestart(e));
    window.addEventListener('gesturechange', (e) => engine.handleGesturechange(e));
    window.addEventListener('gestureend', (e) => engine.handleGestureend(e));

    // Listen for events
    engine.addEventListener('init', () => {
      console.log('Initialized, canvas size:', engine.canvasBounds);
      // Center canvas
      engine.applyTransform(1, [0.5, 0.5], [0.5, 0.5]);
    });

    engine.addEventListener('update', () => {
      console.log('Transform:', {
        translateX: engine.translateX,
        translateY: engine.translateY,
        scale: engine.scale,
        rotate: engine.rotate
      });
      
      // Update matrix overlay
      updateMatrix();
    });

    // Handle clicks
    wrapper.addEventListener('click', (e) => {
      const [x, y] = engine.normalizeClientCoords(e.clientX, e.clientY);
      console.log('Canvas position:', x, y);
    });

    function updateMatrix() {
      const marker = document.getElementById('centerMarker');
      const [cx, cy] = engine.composePoint(
        engine.canvasBounds.width / 2,
        engine.canvasBounds.height / 2
      );
      marker.setAttribute('cx', cx);
      marker.setAttribute('cy', cy);
    }

    // Clean up when done
    // engine.destroy();
  </script>
</body>
</html>
```

## API Reference

### Constructor

```typescript
new Zoompinch(
  element: HTMLElement,
  offset: Offset,
  translateX: number,
  translateY: number,
  scale: number,
  rotate: number,
  minScale?: number,
  maxScale?: number,
  clampBounds?: boolean,
  rotation?: boolean
)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `element` | `HTMLElement` | - | Wrapper element (must contain `.canvas` child) |
| `offset` | `Offset` | - | Inner padding: `{ top, right, bottom, left }` |
| `translateX` | `number` | - | Initial X translation in pixels |
| `translateY` | `number` | - | Initial Y translation in pixels |
| `scale` | `number` | - | Initial scale factor |
| `rotate` | `number` | - | Initial rotation in radians |
| `minScale` | `number` | `0.1` | Minimum scale (user gestures only) |
| `maxScale` | `number` | `10` | Maximum scale (user gestures only) |
| `clampBounds` | `boolean` | `false` | Clamp panning within bounds (user gestures only) |
| `rotation` | `boolean` | `true` | Enable rotation gestures |

**HTML Structure Required:**

```html
<div id="wrapper">
  <div class="canvas">
    <!-- Your content here -->
  </div>
</div>
```

**Note:** `minScale`, `maxScale`, `rotation`, and `clampBounds` only apply during user interaction. Direct property changes are unrestricted.

### Properties

Access and modify transform state:

```javascript
engine.translateX  // number - X translation
engine.translateY  // number - Y translation
engine.scale       // number - Scale factor
engine.rotate      // number - Rotation in radians

engine.minScale    // number - Minimum scale
engine.maxScale    // number - Maximum scale
engine.clampBounds // boolean - Clamp bounds flag
engine.rotation    // boolean - Rotation enabled flag

engine.offset      // Offset - Inner padding object
```

**Read-only properties:**

```javascript
engine.canvasBounds    // Bounds - Canvas dimensions: { x, y, width, height }
engine.wrapperBounds   // Bounds - Wrapper dimensions: { x, y, width, height }
engine.naturalScale    // number - Scale to fit canvas in wrapper
```

---

### Events

The engine extends `EventTarget` and emits two events:

| Event | Description |
|-------|-------------|
| `init` | Fired when canvas dimensions are available |
| `update` | Fired when transform changes |

```javascript
engine.addEventListener('init', () => {
  console.log('Canvas ready:', engine.canvasBounds);
});

engine.addEventListener('update', () => {
  console.log('Transform:', engine.translateX, engine.translateY, engine.scale, engine.rotate);
});
```

### Methods

#### `applyTransform(scale, wrapperCoords, canvasCoords)`

Apply transform by anchoring a canvas point to a wrapper point.

**Parameters:**
- `scale: number` - Target scale
- `wrapperCoords: [number, number]` - Wrapper position (0-1, 0.5 = center)
- `canvasCoords: [number, number]` - Canvas position (0-1, 0.5 = center)

**Examples:**

```javascript
// Center canvas at scale 1
engine.applyTransform(1, [0.5, 0.5], [0.5, 0.5]);

// Zoom to 2x, keep centered
engine.applyTransform(2, [0.5, 0.5], [0.5, 0.5]);

// Anchor canvas top-left to wrapper center
engine.applyTransform(1.5, [0.5, 0.5], [0, 0]);
```

#### `normalizeClientCoords(clientX, clientY)`

Convert global client coordinates to canvas coordinates.

**Parameters:**
- `clientX: number` - Global X from event
- `clientY: number` - Global Y from event

**Returns:** `[number, number]` - Canvas coordinates in pixels

**Example:**

```javascript
wrapper.addEventListener('click', (e) => {
  const [x, y] = engine.normalizeClientCoords(e.clientX, e.clientY);
  console.log('Canvas position:', x, y);
});
```

#### `composePoint(x, y)`

Convert canvas coordinates to wrapper coordinates (accounts for transform).

**Parameters:**
- `x: number` - Canvas X in pixels
- `y: number` - Canvas Y in pixels

**Returns:** `[number, number]` - Wrapper coordinates in pixels

**Example:**

```javascript
// Get wrapper position for canvas center
const [wrapperX, wrapperY] = engine.composePoint(
  engine.canvasBounds.width / 2,
  engine.canvasBounds.height / 2
);
```

#### `rotateCanvas(x, y, radians)`

Rotate canvas around a specific canvas point.

**Parameters:**
- `x: number` - Canvas X (rotation center)
- `y: number` - Canvas Y (rotation center)
- `radians: number` - Rotation angle

**Example:**

```javascript
// Rotate 90° around canvas center
const centerX = engine.canvasBounds.width / 2;
const centerY = engine.canvasBounds.height / 2;
engine.rotateCanvas(centerX, centerY, Math.PI / 2);
```

#### `update()`

Manually trigger a transform update and render.

```javascript
// Modify transform
engine.translateX = 100;
engine.translateY = 50;
engine.scale = 2;

// Apply changes
engine.update();
```

#### `setTranslateFromUserGesture(x, y)`

Set translation with optional clamping based on `clampBounds` setting.

**Parameters:**
- `x: number` - X translation
- `y: number` - Y translation

**Example:**

```javascript
engine.setTranslateFromUserGesture(100, 50);
engine.update();
```

#### `destroy()`

Clean up the engine and remove internal observers.

```javascript
engine.destroy();
```

### Event Handlers

Handle user input by calling these methods:

#### Mouse Events

```javascript
wrapper.addEventListener('wheel', (e) => engine.handleWheel(e));
wrapper.addEventListener('mousedown', (e) => engine.handleMousedown(e));
window.addEventListener('mousemove', (e) => engine.handleMousemove(e));
window.addEventListener('mouseup', (e) => engine.handleMouseup(e));
```

#### Touch Events

```javascript
wrapper.addEventListener('touchstart', (e) => engine.handleTouchstart(e));
window.addEventListener('touchmove', (e) => engine.handleTouchmove(e));
window.addEventListener('touchend', (e) => engine.handleTouchend(e));
```

#### Gesture Events (Safari)

```javascript
wrapper.addEventListener('gesturestart', (e) => engine.handleGesturestart(e));
window.addEventListener('gesturechange', (e) => engine.handleGesturechange(e));
window.addEventListener('gestureend', (e) => engine.handleGestureend(e));
```


## Coordinate Systems

### 1. Canvas Coordinates (Absolute)

Absolute pixels within canvas content.
- Origin: `(0, 0)` at top-left
- Range: `0` to `canvasBounds.width`, `0` to `canvasBounds.height`

```javascript
const [canvasX, canvasY] = engine.normalizeClientCoords(event.clientX, event.clientY);
```

### 2. Wrapper Coordinates (Absolute)

Absolute pixels within viewport/wrapper.
- Origin: `(0, 0)` at top-left (accounting for offset)
- Range: `0` to `wrapperBounds.width`, `0` to `wrapperBounds.height`

```javascript
const [wrapperX, wrapperY] = engine.composePoint(canvasX, canvasY);
```

### 3. Relative Coordinates (0-1)

Normalized coordinates for `applyTransform`.
- Range: `0.0` to `1.0`
- `0.5` = center, `1.0` = bottom-right

```javascript
[0, 0]       // top-left
[0.5, 0.5]   // center
[1, 1]       // bottom-right
```

**Conversion Flow:**

```
Client Coords → normalizeClientCoords() → Canvas Coords → composePoint() → Wrapper Coords
```

## Best Practices

1. **Required HTML structure:**
   ```html
   <div id="wrapper">
     <div class="canvas">
       <!-- content -->
     </div>
   </div>
   ```

2. **Required CSS:**
   ```css
   #wrapper {
     touch-action: none;
     overflow: hidden;
     position: relative;
   }
   .canvas {
     will-change: transform;
   }
   ```

3. **Attach event listeners to window for mouse/touch move/end:**
   ```javascript
   wrapper.addEventListener('mousedown', ...);
   window.addEventListener('mousemove', ...);  // window, not wrapper
   window.addEventListener('mouseup', ...);    // window, not wrapper
   ```

4. **Center content on init:**
   ```javascript
   engine.addEventListener('init', () => {
     engine.applyTransform(1, [0.5, 0.5], [0.5, 0.5]);
   });
   ```

5. **Clean up when done:**
   ```javascript
   engine.destroy();
   ```

---

## Advanced Usage

### Custom Transform Logic

```javascript
// Direct property manipulation
engine.translateX = 100;
engine.translateY = 50;
engine.scale = 2;
engine.rotate = Math.PI / 4;

// Apply changes
engine.update();
```

### Computed Properties

```javascript
// Get wrapper inner dimensions
const innerWidth = engine.wrapperInnerWidth;
const innerHeight = engine.wrapperInnerHeight;

// Get natural scale (scale to fit)
const fitScale = engine.naturalScale;
```

### Clamping Behavior

```javascript
// Enable/disable clamping
engine.clampBounds = true;

// Use clamp-aware setter
engine.setTranslateFromUserGesture(translateX, translateY);
engine.update();
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest, including iOS)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Related

- [@zoompinch/vue](https://www.npmjs.com/package/@zoompinch/vue) - Vue 3
- [@zoompinch/elements](https://www.npmjs.com/package/@zoompinch/elements) - Web Components
- [@zoompinch/core](https://www.npmjs.com/package/@zoompinch/core) - Core engine

Built with ❤️ by Elya Maurice Conrad