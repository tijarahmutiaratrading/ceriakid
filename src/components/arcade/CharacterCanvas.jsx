import React, { useRef, useEffect } from 'react';

// Render watak vektor (dari characters.js) pada canvas kecil — beranimasi + HiDPI tajam
export default function CharacterCanvas({ draw, size = 112, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const c = canvas.getContext('2d');
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    let raf;
    let f = 0;
    const loop = () => {
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, size, size);
      c.translate(size / 2, size / 2);
      const scale = size / 84;
      c.scale(scale, scale);
      draw(c, f++);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw, size]);

  return <canvas ref={ref} style={{ width: size, height: size }} className={className} />;
}