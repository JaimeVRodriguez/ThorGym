// *** CHANGED ***: We remove any "inApp" check and wait until `user.role` is loaded.
// Then we decide whether to route to `/operatorHome` or to `home`.

import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { Slot, useRouter } from "expo-router";
import { AuthContextProvider, useAuth } from "../context/authContext";
import { MenuProvider } from "react-native-popup-menu";
import "../global.css";

function MainLayout() {
    // *** CHANGED ***: Use { user, isAuthenticated } from context
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log("Layout effect => user:", user);
        if (typeof isAuthenticated === "undefined") return;
        if (!isAuthenticated) {
            console.log("Not authenticated => signIn");
            router.replace("signIn");
            return;
        }
        if (!user) {
            console.log("Waiting for user doc...");
            return;
        }
        if (!user.role) {
            console.log("No role => waiting...");
            return;
        }

        console.log("Got role =>", user.role);
        if (user.role === "user") {
            if (user.hasSeenOnboarding === false) {
                console.log("User has NOT seen onboarding => route to Onboarding");
                router.replace("/(app)/onboarding");
            } else {
                console.log("Redirecting to operatorHome...");
                router.replace("/(app)/operatorHome");
            }
        } else if (user.role === "trainer") {
            console.log("Redirecting to trainer home...");
            router.replace("/(app)/home");
        } else {
            console.log("Fallback => (app)/home");
            router.replace("/(app)/home");
        }
    }, [isAuthenticated, user]);

    return <Slot />;
}

export default function RootLayout() {
    return (
        <MenuProvider>
            <AuthContextProvider>
                <MainLayout />
            </AuthContextProvider>
        </MenuProvider>
    );
}
