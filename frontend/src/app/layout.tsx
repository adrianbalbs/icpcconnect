"use client";

import { useEffect } from "react";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  return (
    <html lang="en">
      <body>
        {userSession && <Navbar />}
        {children}
      </body>
    </html>
  );
}
