'use client';

import React, { useState, useEffect } from 'react';

const SnowEffect = () => {
  const [snowflakes, setSnowflakes] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    // Generate snowflakes only on client side to avoid hydration mismatch
    const flakes = [...Array(50)].map((_, i) => {
      const style = {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 3 + 10}s`,
        opacity: Math.random() * 0.6 + 0.2,
      };
      return (
        <div key={i} className="snowflake" style={style}>
          ❄
        </div>
      );
    });
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="snow-container pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {snowflakes}
    </div>
  );
};

export default SnowEffect;
