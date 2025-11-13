import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";

import "../global.css";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConsumerStatusProvider } from "@/contexts/ConsumerStatusContext";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConsumerStatusProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Stack screenOptions={{ headerShown: false }} />
        </TooltipProvider>
      </ConsumerStatusProvider>
    </QueryClientProvider>
  );
}
