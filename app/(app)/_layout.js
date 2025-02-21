import React from 'react';
import { Stack } from 'expo-router';
import HomeHeader from '../../components/HomeHeader';

export default function _layout() {
    return (
        <Stack>
            <Stack.Screen
                name='trainerHome'
                options={{
                    header: () => <HomeHeader />,
                }}
            />

            <Stack.Screen
                name='operatorHome'
                options={{
                    header: () => <HomeHeader />,
                }}
            />

            <Stack.Screen
                name='onboarding'
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
