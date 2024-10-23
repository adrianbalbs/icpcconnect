"use client";

import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import {
  AuthContextProvider,
  useAuth,
} from "@/components/AuthProvider/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthContextProvider>
      <Root>{children}</Root>
    </AuthContextProvider>
  );
}

function Root({ children }: { children: React.ReactNode }) {
  const { userSession, isLoading } = useAuth();
  return (
    <html lang="en">
      <body>
        {!isLoading && userSession.id && <Navbar />}
        {children}
      </body>
    </html>
  );
}
