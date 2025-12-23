import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Zoompinch, type ZoompinchProps, type ZoompinchRef, type Transform } from '../src/index';

function App() {
  const zoompinchRef = useRef<ZoompinchRef>(null);
  const [transform, setTransform] = useState<Transform>({
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0
  });

  function handleInit() {
    // Center canvas on initialization
    zoompinchRef.current?.applyTransform(1, [0.5, 0.5], [0.5, 0.5], 0);
  }

  function handleTransformChange(newTransform: Transform) {
    console.log('Transform updated:', newTransform);
  }

  function handleClick(event: React.MouseEvent) {
    if (!zoompinchRef.current) return;
    const [x, y] = zoompinchRef.current.normalizeClientCoords(event.clientX, event.clientY);
    console.log('Clicked at canvas position:', x, y);
  }

  return (
    <Zoompinch
      ref={zoompinchRef}
      style={{ width: '800px', height: '600px', border: '1px solid #ccc' }}
      transform={transform}
      onTransformChange={handleTransformChange}
      offset={{ top: 0, right: 0, bottom: 0, left: 0 }}
      minScale={0.5}
      maxScale={4}
      clampBounds={false}
      rotation={true}
      zoomSpeed={1}
      translateSpeed={1}
      zoomSpeedAppleTrackpad={1}
      translateSpeedAppleTrackpad={1}
      mouse={true}
      wheel={true}
      touch={true}
      gesture={true}
      onInit={handleInit}
      onClick={handleClick}
      matrix={({ composePoint, normalizeClientCoords, canvasWidth, canvasHeight }) => {
        const [x, y] = composePoint(100, 100);

        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <circle cx={x} cy={y} r="5" fill="#f00" />
          </svg>
        );
      }}
    >
      <img 
        width="1536" 
        height="2048" 
        src="https://imagedelivery.net/mudX-CmAqIANL8bxoNCToA/489df5b2-38ce-46e7-32e0-d50170e8d800/public"
        draggable={false}
        style={{ userSelect: 'none' }}
      />
    </Zoompinch>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
