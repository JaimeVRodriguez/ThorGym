import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/authContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function OperatorHome() {
    const router = useRouter();
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user?.uid) return;

        const notificationsQuery = collection(db, 'notifications');

        const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            const unreadNotifications = snapshot.docs.filter(doc => {
                const data = doc.data();
                return !data.readBy || !data.readBy.includes(user.uid); // Correctly check if the user has read it
            });

            setUnreadCount(unreadNotifications.length);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    return (
        <View className="flex-4 p-4 bg-white">
            <View className="flex-row justify-between">
                <Text className="text-xl font-bold">
                    User Home
                </Text>

                <TouchableOpacity
                    className="relative"
                    onPress={() => router.push('notifications')}
                >
                    <Ionicons
                        name="notifications-outline"
                        size={28}
                        color="#333"
                    />
                    {unreadCount > 0 && (
                        <View className='absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center'>
                            <Text className='text-white text-xs font-bold'>
                                {unreadCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
