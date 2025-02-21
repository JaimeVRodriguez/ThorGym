import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View, Image } from 'react-native';
import { useAuth } from '../../context/authContext';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { blurhash } from '../../utils/common';

export default function Home() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) getUsers();
    }, []);

    const getUsers = async () => {
        setLoading(true);
        try {
            const userQuery = query(
                collection(db, 'users'),
                where('assignedCoach', '==', user?.uid)
            );

            const querySnapshot = await getDocs(userQuery);
            let data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setUsers(data);
        } catch (error) {
            console.error('Error fetching assigned users:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className='flex-1 bg-white p-4'>
            <Text className='text-xl font-bold text-gray-900 mb-4'>
                Trainer Home
            </Text>

            {loading ? (
                <ActivityIndicator size='large' color='#06402B' />
            ) : users.length > 0 ? (
                <FlatList
                    key={'2 columns'}
                    numColumns={2}
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className='flex-1 m-2 p-4 bg-gray-100 rounded-lg'>
                            <Image
                                style={{
                                    height: hp(10),
                                    width: hp(10),
                                    borderRadius: 100,
                                }}
                                source={item.profileUrl}
                                placeholder={blurhash}
                                transition={500}
                            />
                            <Text className='text-lg font-semibold text-gray-800'>
                                {item.username ?? 'Unnamed User'}
                            </Text>
                        </View>
                    )}
                />
            ) : (
                <Text className='text-gray-500 text-center mt-4'>
                    No users assigned to you yet.
                </Text>
            )}
        </View>
    );
}
