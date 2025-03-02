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
        <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}
            >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    User Home
                </Text>

                <TouchableOpacity
                    onPress={() => router.push('notifications')}
                >
                    <Ionicons
                        name="notifications-outline"
                        size={28}
                        color="#333"
                    />

                    {unreadCount > 0 && (
                        <View
                            style={{
                                position: 'absolute',
                                top: -5,
                                right: -5,
                                backgroundColor: 'red',
                                borderRadius: 10,
                                width: 18,
                                height: 18,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                                {unreadCount}
                            </Text>
                        </View>
                    )}

                </TouchableOpacity>
            </View>

            <Text>
                Operator Home
            </Text>
        </View>
    );
}
