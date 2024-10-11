'use client';

import { useEffect, useState } from 'react';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    // setIsLoggedIn(localStorage.getItem('role') !== null);
  });

  return (
    <html lang="en">
      <body>
        {isLoggedIn && <Navbar />}
        {children}
      </body>
    </html>
  )
}
