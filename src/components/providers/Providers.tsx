'use client';

import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UsersProvider } from "@/context/UsersContext";
import { AuthProvider } from "@/context/AuthContext";
import { DemandsProvider } from "@/context/DemandsContext";
import { RecruitmentProvider } from "@/context/RecruitmentContext";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <TooltipProvider>
                <UsersProvider>
                    <AuthProvider>
                        <DemandsProvider>
                            <RecruitmentProvider>
                                {children}
                                <Toaster />
                            </RecruitmentProvider>
                        </DemandsProvider>
                    </AuthProvider>
                </UsersProvider>
            </TooltipProvider>
        </SessionProvider>
    );
}
