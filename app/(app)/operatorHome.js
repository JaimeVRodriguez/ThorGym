import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function UserHome({ navigation }) {
    const router = useRouter();

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
            {/* Title + Bell Icon in top row */}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    User Home
                </Text>

                {/* Bell Icon */}
                <TouchableOpacity
                    onPress={() => router.push('notifications')}
                >
                    <Ionicons
                        name='notifications-outline'
                        size={28}
                        color='#333'
                    />
                    {/* If you want a badge, you can overlay a small circle showing the count */}
                </TouchableOpacity>
            </View>

            <Text>Operator Home</Text>
        </View>
    );
}
