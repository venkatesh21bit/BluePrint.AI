import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function PaywallModal({ isOpen, onClose, title = "Limit Reached", description = "You have hit the usage limit for standard accounts." }: PaywallModalProps) {
  const bmcContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && bmcContainerRef.current) {
      // Clear previous
      bmcContainerRef.current.innerHTML = '';
      
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
      
      bmcContainerRef.current.appendChild(script);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-[#0A0A0A] border border-white/10 p-8 shadow-2xl rounded-2xl"
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-neutral-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white mb-3">{title}</h2>
              <p className="text-neutral-400 mb-8 max-w-sm text-balance">
                {description}
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full mb-8">
                <h3 className="text-lg font-medium text-white mb-2">Exclusive Membership</h3>
                <ul className="text-sm text-neutral-400 space-y-2 mb-6 text-left">
                  <li className="flex items-center gap-2">✓ Unlimited AI Planner Chats</li>
                  <li className="flex items-center gap-2">✓ Unlimited Workspace Initializations</li>
                  <li className="flex items-center gap-2">✓ Unlimited Multi-Agent Simulations</li>
                </ul>
                
                <div className="flex justify-center" ref={bmcContainerRef}>
                  {/* BMC button will inject here */}
                </div>
              </div>
              
              <p className="text-xs text-neutral-500">
                After purchasing, your account will be automatically upgraded via Webhook.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
