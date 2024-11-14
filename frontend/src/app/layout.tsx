"use client";

import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import {
  AuthContextProvider,
  useAuth,
} from "@/components/AuthProvider/AuthProvider";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthContextProvider>
        <Root>{children}</Root>
      </AuthContextProvider>
    </LocalizationProvider>
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
