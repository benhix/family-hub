'use client';

import React from 'react'   
import NavBar from './NavBar'
import { usePathname } from 'next/navigation';

const ClientConditionalNavBar = () => {
    const pathname = usePathname();
    const hideNavBar = pathname === '/qr-scan/pet-feeding' || pathname.startsWith('/sign-in');
  return (
    <div className="sticky top-0 z-40 bg-[#D6DBDC]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {!hideNavBar && <NavBar />}
    </div>
  )
}

export default ClientConditionalNavBar
