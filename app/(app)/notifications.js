import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { db } from '../../firebaseConfig';
import {
    collection,
    query,
    where,
    orderBy,
    getDocs
} from 'firebase/firestore';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Listen in real-time to notifications for role="user"
        getNotifications();

        // const unsubscribe = onSnapshot(q, (snapshot) => {
        //     const results = [];
        //     snapshot.forEach((doc) =>
        //         results.push({ id: doc.id, ...doc.data() })
        //     );
        //     setNotifications(results);
        // });

        // return () => unsubscribe();

        

    }, []);

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
    }


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
                    renderItem={({ item }) => (
                        <View style={styles.notificationItem}>
                            <Text style={styles.message}>{item.message}</Text>
                            {/* If you want to show date/time, you can parse item.createdAt */}
                        </View>
                    )}
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
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: '#333',
    },
});
