"use client";

import "@/styles/globals.css";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AuthContextProvider } from "@/components/context-provider/AuthProvider";
import { NavContextProvider } from "@/components/context-provider/NavProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthContextProvider>
        <html lang="en">
          <body>
            <NavContextProvider>{children}</NavContextProvider>
          </body>
        </html>
      </AuthContextProvider>
    </LocalizationProvider>
  );
}
