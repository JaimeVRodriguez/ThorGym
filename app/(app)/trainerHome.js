import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Button,
    FlatList,
    Image,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { db } from '../../firebaseConfig';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { useAuth } from '../../context/authContext';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { blurhash } from '../../utils/common';
import FloatingActionButton from '../../components/FloatingActionButton';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Home() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notificationText, setNotificationText] = useState('');
    const isExpanded = useSharedValue(false);

    useEffect(() => {
        if (user?.uid) {
            getUsers();
        }
    }, [user?.uid]);

    const getUsers = async () => {
        setLoading(true);
        try {
            const userQuery = query(
                collection(db, 'users'),
                where('assignedCoach', '==', user?.uid)
            );

            const querySnapshot = await getDocs(userQuery);
            const data = [];
            querySnapshot.forEach((doc) =>
                data.push({ id: doc.id, ...doc.data() })
            );
            setUsers(data);
        } catch (error) {
            console.error('Error fetching assigned users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePressFAB = () => {
        isExpanded.value = !isExpanded.value;
    };

    const plusIconStyle = useAnimatedStyle(() => {
        const moveValue = interpolate(Number(isExpanded.value), [0, 1], [0, 2]);
        const translateValue = withTiming(moveValue);
        const rotateValue = isExpanded.value ? '45deg' : '0deg';

        return {
            transform: [
                { translateX: translateValue },
                { rotate: withTiming(rotateValue) }
            ]
        };
    });

    const openNotificationModal = () => {
        setShowNotificationModal(true);
    };

    const closeNotificationModal = () => {
        setShowNotificationModal(false);
        setNotificationText('');
    };

    const handleSendNotification = async () => {
        try {
            if (!notificationText.trim()) {
                closeNotificationModal();
                return;
            }
            await addDoc(collection(db, 'notifications'), {
                message: notificationText,
                createdAt: serverTimestamp(),
                toRole: 'user'
            });
            console.log('Notification sent!', notificationText);
            closeNotificationModal();
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                    Trainer Home
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#06402B"/>
                ) : users.length > 0 ? (
                    <FlatList
                        numColumns={2}
                        data={users}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View
                                style={{
                                    flex: 1,
                                    margin: 8,
                                    padding: 16,
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: 8
                                }}
                            >
                                <Image
                                    style={{
                                        height: hp(10),
                                        width: hp(10),
                                        borderRadius: 100
                                    }}
                                    source={item.profileUrl}
                                    placeholder={blurhash}
                                    transition={500}
                                />
                                <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 8 }}>
                                    {item.username ?? 'Unnamed User'}
                                </Text>
                            </View>
                        )}
                    />
                ) : (
                    <Text style={{ textAlign: 'center', marginTop: 16, color: '#6b7280' }}>
                        No users assigned to you yet.
                    </Text>
                )}

                <View style={styles.fabContainer}>
                    <View style={styles.fabColumn}>
                        <AnimatedPressable
                            onPress={handlePressFAB}
                            style={[styles.shadow, mainButtonStyles.button]}
                        >
                            <Animated.Text style={[plusIconStyle, mainButtonStyles.content]}>
                                +
                            </Animated.Text>
                        </AnimatedPressable>

                        <FloatingActionButton
                            isExpanded={isExpanded}
                            index={1}
                            buttonLabel="Create Workout"
                            onPress={() => {
                                console.log('Create Workout tapped!');
                                isExpanded.value = false;
                            }}
                        />
                        <FloatingActionButton
                            isExpanded={isExpanded}
                            index={2}
                            buttonLabel="Send Notification"
                            onPress={() => {
                                openNotificationModal();
                                isExpanded.value = false;
                            }}
                        />
                    </View>
                </View>

                <Modal
                    visible={showNotificationModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={closeNotificationModal}
                >
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContent}>
                            <Text style={{ fontWeight: '600', fontSize: 18, marginBottom: 8 }}>
                                Send a Notification
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter notification text..."
                                value={notificationText}
                                onChangeText={setNotificationText}
                            />
                            <View style={{ flexDirection: 'row', marginTop: 12 }}>
                                <Button title="Cancel" onPress={closeNotificationModal}/>
                                <View style={{ width: 20 }}/>
                                <Button title="Send" onPress={handleSendNotification}/>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const mainButtonStyles = StyleSheet.create({
    button: {
        zIndex: 2,
        height: 56,
        width: 56,
        borderRadius: 28,
        backgroundColor: '#06402B',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        fontSize: 24,
        color: '#f8f9ff'
    }
});

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20
    },
    fabColumn: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        overflow: 'visible'
    },
    content: {
        color: '#f8f9ff',
        fontWeight: '500'
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '80%',
        minHeight: 200,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center'
    },
    textInput: {
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        marginTop: 8,
        borderRadius: 6,
        padding: 8
    }
});
