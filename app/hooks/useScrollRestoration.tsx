'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top whenever the route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Also scroll to top on initial load
    window.scrollTo(0, 0);
  }, []);
} 