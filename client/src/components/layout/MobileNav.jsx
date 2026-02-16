import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X as XIcon, ArrowRight, Zap } from 'lucide-react';

/**
 * Shared mobile navigation for public pages.
 * Drop into any page nav that uses the standard Slay Season layout.
 *
 * Usage:
 *   <MobileNav />
 *
 * Renders the hamburger button (visible md:hidden) and the mobile dropdown.
 */
export default function MobileNav() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const go = (path) => { navigate(path); setOpen(false); };

  return (
    <>
      <button
        className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-50" style={{ backdropFilter: 'blur(24px) saturate(200%)', background: 'rgba(14,17,28,.95)', borderTop: '1px solid rgba(255,255,255,.05)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div className="px-4 py-4 space-y-1">
            {[
              ['Home', '/'],
              ['Pricing', '/pricing'],
              ['About', '/about'],
              ['Blog', '/blog'],
              ['Academy', '/academy'],
              ['Help', '/help'],
              ['Contact', '/contact'],
            ].map(([label, path]) => (
              <button
                key={path}
                onClick={() => go(path)}
                className="block w-full text-left text-[#8b92b0] hover:text-white py-3 min-h-[44px] text-sm"
              >
                {label}
              </button>
            ))}
            <hr className="border-white/5" />
            <button onClick={() => go('/login')} className="block w-full text-left text-[#8b92b0] hover:text-white py-3 min-h-[44px] text-sm">Log in</button>
            <button
              onClick={() => go('/signup')}
              className="w-full text-white py-3 rounded-lg font-semibold text-sm mt-2"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              Start Free Trial
            </button>
          </div>
        </div>
      )}
    </>
  );
}
