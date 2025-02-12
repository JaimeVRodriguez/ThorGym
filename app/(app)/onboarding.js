import React, {useState, useEffect} from "react";
import {View, Text, TouchableOpacity, FlatList} from "react-native";
import {db} from "../../firebaseConfig";
import {collection, query, where, getDocs} from "firebase/firestore";
import Animated, {SlideInRight} from "react-native-reanimated";
import {useRouter} from "expo-router";
import {doc, updateDoc} from "firebase/firestore";
import {useAuth} from "../../context/authContext";

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

    return (
        <Animated.View
            entering={SlideInRight.duration(500)}
            className="flex-1 items-center justify-center bg-white px-4"
        >
            <Text className="text-2xl font-bold mb-4">Select Your Coach</Text>

            {/* 4) Display the list of trainers */}
            <FlatList
                data={coaches}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => {
                    const isSelected = item.id === selectedCoach;
                    return (
                        <TouchableOpacity
                            onPress={() => handleCoachSelect(item.id)}
                            className={`mb-3 p-4 rounded-lg ${
                                isSelected ? "bg-blue-500" : "bg-gray-200"
                            }`}
                        >
                            <Text
                                className={`text-lg font-semibold ${
                                    isSelected ? "text-white" : "text-black"
                                }`}
                            >
                                {item.username ?? "Unnamed Coach"}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* 5) Only show continue if user selected a coach */}
            {selectedCoach && (
                <TouchableOpacity
                    onPress={handleContinue}
                    className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
                >
                    <Text className="text-white text-lg font-bold">Continue</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}
