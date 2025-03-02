import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
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

            // Mark as read only for this user
            for (const notificationDoc of snapshot.docs) {
                const notificationData = notificationDoc.data();
                if (!notificationData.readBy?.includes(user.uid)) {
                    await updateDoc(doc(db, 'notifications', notificationDoc.id), {
                        readBy: [...notificationData.readBy, user.uid] // Append user ID
                    });
                }
            }
        };

        fetchNotifications();
    }, [user?.uid]);

    const getNotifications = async () => {
        try {
            const q = query(
                collection(db, 'notifications'),
                where('toRole', '==', 'user'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const results = [];
            querySnapshot.forEach((doc) =>
                results.push({ id: doc.id, ...doc.data() })
            );
            setNotifications(results);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Notifications</Text>
            {notifications.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 16 }}>
                    No notifications yet.
                </Text>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const isUnread = !item.readBy?.includes(user.uid); // Check if user has read it

                        return (
                            <View style={styles.notificationItem}>
                                <Text style={[styles.message, isUnread && styles.unreadMessage]}>
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

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    notificationItem: {
        backgroundColor: '#f3f4f6',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8
    },
    message: {
        fontSize: 16,
        color: '#333'
    },
    unreadMessage: {
        fontWeight: 'bold' // Apply bold styling to unread messages
    }
});