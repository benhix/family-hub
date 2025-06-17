'use client';

import { useScrollRestoration } from '@/app/hooks/useScrollRestoration';

export default function ScrollRestorationWrapper({ children }: { children: React.ReactNode }) {
  useScrollRestoration();
  return <>{children}</>;
} 