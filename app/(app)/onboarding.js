import React, {useState, useEffect} from "react";
import {View, Text, TouchableOpacity, FlatList, SafeAreaView} from "react-native";
import {db} from "../../firebaseConfig";
import {collection, query, where, getDocs, arrayUnion} from "firebase/firestore";
import Animated, {SlideInRight} from "react-native-reanimated";
import {useRouter} from "expo-router";
import {doc, updateDoc} from "firebase/firestore";
import {useAuth} from "../../context/authContext";
import { LinearGradient } from "expo-linear-gradient";
import {StatusBar} from "expo-status-bar";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function OnboardingScreen() {
    const router = useRouter();
    const {user} = useAuth();
    const [coaches, setCoaches] = useState([]);
    const [selectedCoach, setSelectedCoach] = useState(null);

    // 1) Fetch the trainers
    useEffect(() => {
        async function fetchCoaches() {
            try {
                const q = query(collection(db, "users"), where("role", "==", "trainer"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCoaches(data);
            } catch (err) {
                console.log("Error fetching coaches:", err);
            }
        }

        fetchCoaches();
    }, []);

    // 2) Handle selecting a coach
    const handleCoachSelect = (coachId) => {
        setSelectedCoach(coachId);
    };

    // 3) Mark onboarding complete and navigate
    const handleContinue = async () => {
        if (!user?.uid || !selectedCoach) return;

        // 1) Update user doc (as before)
        await updateDoc(doc(db, "users", user.uid), {
            hasSeenOnboarding: true,
            assignedCoach: selectedCoach
        });

        // 2) ALSO update the trainer doc to store this user
        const trainerDocRef = doc(db, "users", selectedCoach);
        await updateDoc(trainerDocRef, {
            assignedUsers: arrayUnion(user.uid)
        });

        router.replace("/(app)/operatorHome");
    };

    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-white">
            {/* Make the status bar translucent so the gradient appears behind the notch */}
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Animate the entire screen on entry */}
            <Animated.View entering={SlideInRight.duration(500)} className="flex-1">
                {/* TOP: Full-bleed gradient */}
                <LinearGradient
                    colors={["#F8B500", "#F76B1C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="h-1/3 w-full px-4 pb-6 rounded-b-3xl justify-end"
                    style={{paddingTop: insets.top + 60, paddingLeft: insets.left + 10}}
                    // Optionally add top padding to avoid text under notch, e.g. "pt-12"
                    // className="h-1/3 w-full px-4 pb-6 pt-12 rounded-b-3xl justify-end"
                >
                    <Text className="text-3xl font-bold text-white mb-2">Welcome!</Text>
                    <Text className="text-base text-white mb-8">
                        Let’s find the right coach to get you started
                    </Text>
                </LinearGradient>

                {/* MIDDLE: Coach selection */}
                <View className="flex-1 px-4 pt-6">
                    <Text className="text-xl font-bold text-gray-900 mb-2">Select Your Coach</Text>
                    <Text className="text-base text-gray-500 mb-4">
                        Pick from the list below. You can always change later.
                    </Text>

                    <FlatList
                        data={coaches}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        renderItem={({ item }) => {
                            const isSelected = item.id === selectedCoach;
                            return (
                                <TouchableOpacity
                                    onPress={() => handleCoachSelect(item.id)}
                                    className={`
                    mb-3 p-4 rounded-full
                    border border-gray-300
                    ${isSelected ? "bg-blue-600 border-blue-600" : "bg-white"}
                  `}
                                >
                                    <Text
                                        className={`
                      text-base font-semibold
                      ${isSelected ? "text-white" : "text-gray-800"}
                    `}
                                    >
                                        {item.username ?? "Unnamed Coach"}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>

                {/* BOTTOM: Continue button pinned above system nav */}
                {selectedCoach && (
                    <View className="absolute bottom-0 w-full px-4 py-4 bg-white">
                        <TouchableOpacity
                            onPress={handleContinue}
                            className="bg-blue-600 rounded-full py-4 items-center"
                        >
                            <Text className="text-white text-lg font-bold">Continue</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </View>
    );
}
