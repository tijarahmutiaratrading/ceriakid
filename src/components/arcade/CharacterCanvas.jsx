import React, { useRef, useEffect } from 'react';

// Render watak vektor (dari characters.js) pada canvas kecil — beranimasi
export default function CharacterCanvas({ draw, size = 112, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current.getContext('2d');
    let raf;
    let f = 0;
    const loop = () => {
      c.clearRect(0, 0, size, size);
      c.save();
      c.translate(size / 2, size / 2);
      const scale = size / 84;
      c.scale(scale, scale);
      draw(c, f++);
      c.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw, size]);

  return <canvas ref={ref} width={size} height={size} className={className} />;
}