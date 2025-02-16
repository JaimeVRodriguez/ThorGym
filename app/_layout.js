import { Slot, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { MenuProvider } from 'react-native-popup-menu';
import { AuthContextProvider, useAuth } from '../context/authContext';
import '../global.css';

function MainLayout() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (typeof isAuthenticated === 'undefined') return;

        if (!isAuthenticated) {
            router.replace('signIn');
            return;
        }

        if (!user) {
            return;
        }

        if (!user.role) {
            return;
        }

        if (user.role === 'user') {
            if (user.hasSeenOnboarding === false) {
                router.replace('/(app)/onboarding');
            } else {
                router.replace('/(app)/operatorHome');
            }
        } else if (user.role === 'trainer') {
            router.replace('/(app)/trainerHome');
        } else {
            router.replace('/(app)/trainerHome');
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
