import React, { useEffect, useRef } from "react";

export const StarField = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create random stars
    const container = containerRef.current;
    const starCount = 50;
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.animationDuration = `${3 + Math.random() * 2}s`;
      container.appendChild(star);
    }

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="starfield" />;
};