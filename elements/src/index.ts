import { ZoomPinchElement } from './elements/zoom-pinch';

if (!customElements.get('zoom-pinch')) {
  customElements.define('zoom-pinch', ZoomPinchElement);
}
