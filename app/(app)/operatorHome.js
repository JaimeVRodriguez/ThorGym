import React, { useEffect, useState } from 'react';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import {StatusBar} from "expo-status-bar";
import ChatList from "../../components/ChatList";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {useAuth} from "../../context/authContext";


export default function UserHome() {
    const {user} = useAuth();
    const [coaches, setCoaches] = useState([]);

    useEffect(() => {
        async function fetchCoaches() {
            try {
                // Query all users whose role is "coach"
                const q = query(collection(db, 'users'), where('role', '==', 'trainer'));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => doc.data());
                setCoaches(data);
            } catch (err) {
                console.log('Error fetching coaches:', err);
            }
        }

        fetchCoaches();
    }, []);

    const renderCoach = ({ item }) => {
        return (
            <View style={{ marginVertical: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.username}</Text>
                <Text>Email: {item.email}</Text>
                {/* Show item.profileUrl if you want to display the coach's avatar */}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <Text>Operator Home</Text>
        </View>
    );
}
