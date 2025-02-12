// /app/(app)/onboarding.js

import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../../context/authContext";

export default function OnboardingScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [selectedCoach, setSelectedCoach] = useState(null);

    const handleCoachSelect = (coach) => {
        setSelectedCoach(coach);
    };

    const handleContinue = async () => {
        if (!user?.uid) return;
        const docRef = doc(db, "users", user.uid);

        // Update Firestore to mark onboarding as done
        await updateDoc(docRef, {
            hasSeenOnboarding: true
        });

        // Then navigate to operatorHome
        router.replace("/(app)/operatorHome");
    };

    return (
        <Animated.View
            entering={SlideInRight.duration(500)}
            className="flex-1 items-center justify-center bg-white px-4"
        >
            <Text className="text-2xl font-bold mb-6">Select Your Coach</Text>

            <TouchableOpacity
                onPress={() => handleCoachSelect("Coach A")}
                className={`px-5 py-3 rounded-md mb-3 ${
                    selectedCoach === "Coach A" ? "bg-blue-500" : "bg-gray-200"
                }`}
            >
                <Text className={`text-lg ${selectedCoach === "Coach A" ? "text-white" : "text-black"}`}>
                    Coach A
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => handleCoachSelect("Coach B")}
                className={`px-5 py-3 rounded-md mb-3 ${
                    selectedCoach === "Coach B" ? "bg-blue-500" : "bg-gray-200"
                }`}
            >
                <Text className={`text-lg ${selectedCoach === "Coach B" ? "text-white" : "text-black"}`}>
                    Coach B
                </Text>
            </TouchableOpacity>

            {selectedCoach && (
                <TouchableOpacity
                    onPress={handleContinue}
                    className="mt-6 bg-blue-600 px-5 py-3 rounded-md"
                >
                    <Text className="text-white text-lg">Continue</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}
