import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, arrayUnion, doc, updateDoc } from "firebase/firestore";
import Animated, { SlideInRight } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authContext";
import Svg, { Defs, Path, Stop } from "react-native-svg";
import { LinearGradient as SvgLinearGradient } from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OnboardingScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [trainers, setTrainers] = useState([]);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        async function fetchCoaches() {
            try {
                const userQuery = query(collection(db, "users"), where("role", "==", "trainer"));
                const snapshot = await getDocs(userQuery);
                const data = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...docSnap.data(),
                }));
                setTrainers(data);
            } catch (err) {
                console.log("Error fetching coaches:", err);
            }
        }
        fetchCoaches();
    }, []);

    const handleCoachSelect = (coachId) => {
        setSelectedCoach(coachId);
    };

    const handleContinue = async () => {
        if (!user?.uid || !selectedCoach) return;

        await updateDoc(doc(db, "users", user.uid), {
            hasSeenOnboarding: true,
            assignedCoach: selectedCoach
        });

        const trainerDocRef = doc(db, "users", selectedCoach);
        await updateDoc(trainerDocRef, {
            assignedUsers: arrayUnion(user.uid)
        });

        router.replace("/(app)/operatorHome");
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar translucent backgroundColor="transparent" style="light" />
            <Animated.View entering={SlideInRight.duration(500)} className="flex-1">

                {/* WAVE CONTAINER */}
                <View className="relative w-full" style={{ height: "30%" }}>
                    <Svg
                        viewBox="0 0 1440 320"
                        preserveAspectRatio="none"
                        className="absolute top-0 left-0 w-full h-full"
                    >
                        <Defs>
                            <SvgLinearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0%" stopColor="#F8B500" />
                                <Stop offset="100%" stopColor="#F76B1C" />
                            </SvgLinearGradient>
                        </Defs>
                        <Path
                            fill="#06402B"
                            fillOpacity="1"
                            d="M0,288L80,277.3C160,267,320,245,480,250.7C640,256,800,288,960,288C1120,288,1280,256,1360,240L1440,224L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
                        />
                    </Svg>

                    {/* TEXT OVERLAY */}
                    <View
                        className="absolute w-full"
                        style={{ top: insets.top + 40, paddingHorizontal: 20 }}
                    >
                        <Text className="text-3xl font-bold text-white mb-2">Welcome!</Text>
                        <Text className="text-base text-white">
                            Let’s find the right coach to get you started
                        </Text>
                    </View>
                </View>

                {/* MAIN CONTENT: Trainer selection */}
                <View className="flex-1 px-4 pt-6">
                    <Text className="text-xl font-bold text-gray-900 mb-2">Select Your Trainer</Text>
                    <Text className="text-base text-gray-500 mb-4">
                        Pick from the list below. You can always change later.
                    </Text>
                    <FlatList
                        data={trainers}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        renderItem={({ item }) => {
                            const isSelected = item.id === selectedCoach;
                            return (
                                <TouchableOpacity
                                    onPress={() => handleCoachSelect(item.id)}
                                    className={`mb-3 p-4 rounded-full border border-gray-300 ${isSelected ? "bg-psyop-green border-psyop-green" : "bg-white"}`}
                                >
                                    <Text className={`text-base font-semibold ${isSelected ? "text-white" : "text-gray-800"}`}>
                                        {item.username ?? "Unnamed Coach"}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>

                {selectedCoach && (
                    <View className="absolute bottom-6 w-full px-4 py-4 bg-white">
                        <TouchableOpacity
                            onPress={handleContinue}
                            className="bg-psyop-green rounded-full py-4 items-center"
                        >
                            <Text className="text-white text-lg font-bold">Continue</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </View>
    );
}
