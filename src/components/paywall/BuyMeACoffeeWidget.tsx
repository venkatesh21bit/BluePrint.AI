"use client";

import React, { useEffect, useRef } from 'react';

export function BuyMeACoffeeWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && containerRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js';
      script.type = 'text/javascript';
      script.setAttribute('data-name', 'bmc-button');
      script.setAttribute('data-slug', 'venkateshkr');
      script.setAttribute('data-color', '#FFDD00');
      script.setAttribute('data-emoji', '💎');
      script.setAttribute('data-font', 'Cookie');
      script.setAttribute('data-text', 'Get Exclusive');
      script.setAttribute('data-outline-color', '#000000');
      script.setAttribute('data-font-color', '#000000');
      script.setAttribute('data-coffee-color', '#ffffff');
      
      containerRef.current.appendChild(script);
    }
  }, []);

  return <div ref={containerRef} className="flex justify-center" />;
}
