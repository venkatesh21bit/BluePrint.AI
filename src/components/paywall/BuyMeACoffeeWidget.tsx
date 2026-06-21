import React from 'react';
import Link from 'next/link';

export function BuyMeACoffeeWidget() {
  return (
    <div className="flex justify-center hover:-translate-y-0.5 transition-transform">
      <Link href="https://buymeacoffee.com/venkateshkr" target="_blank" rel="noopener noreferrer">
        <img 
          src="https://img.buymeacoffee.com/button-api/?text=Get%20Exclusive&emoji=%F0%9F%92%8E&slug=venkateshkr&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" 
          alt="Buy Me A Coffee" 
          className="h-[60px] w-auto shadow-lg rounded-xl"
        />
      </Link>
    </div>
  );
}
