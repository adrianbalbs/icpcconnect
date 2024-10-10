'use client';

import { useEffect, useState } from 'react';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleStorageChange = () => {
    setIsLoggedIn(localStorage.getItem('token') !== null);
  }

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <html lang="en">
      <body>
        {<Navbar />}
        {children}
      </body>
    </html>
  )
}