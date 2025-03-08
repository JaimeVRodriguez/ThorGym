import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useAuth } from '../../context/authContext';

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user?.uid) return;

        const fetchNotifications = async () => {
            const notificationsQuery = query(collection(db, 'notifications'));
            const snapshot = await getDocs(notificationsQuery);
            const notificationsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setNotifications(notificationsData);

            for (const notificationDoc of snapshot.docs) {
                const notificationData = notificationDoc.data();
                if (!notificationData.readBy?.includes(user.uid)) {
                    await updateDoc(doc(db, 'notifications', notificationDoc.id), {
                        readBy: [...notificationData.readBy, user.uid]
                    });
                }
            }
        };

        fetchNotifications();
    }, [user?.uid]);

    return (
        <View className="flex-1 p-4 bg-white">
            <Text className="text-xl font-bold mb-4">Notifications</Text>
            {notifications.length === 0 ? (
                <Text className="text-center mt-4">No notifications yet.</Text>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const isUnread = !item.readBy?.includes(user.uid);
                        return (
                            <View className="bg-gray-200 p-3 rounded-lg mb-2">
                                <Text className={`text-lg ${isUnread ? 'font-bold' : ''}`}>
                                    {item.message}
                                </Text>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}
