import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Pressable,
  Text,
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { db } from '../../firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from '../../context/authContext';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { blurhash } from '../../utils/common';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
  duration: 1200,
  overshootClamping: true,
  dampingRatio: 0.8,
};

const OFFSET = 60;

// Sub-button
const FloatingActionButton = ({ isExpanded, index, buttonLabel, onPress }) => {
  const animatedStyles = useAnimatedStyle(() => {
    const moveDistance = isExpanded.value ? OFFSET * index : 0;
    const translateValue = withSpring(-moveDistance, SPRING_CONFIG);

    const delay = index * 100;
    const scaleValue = isExpanded.value ? 1 : 0;

    return {
      transform: [
        { translateY: translateValue },
        {
          scale: withDelay(delay, withTiming(scaleValue)),
        },
      ],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[animatedStyles, styles.shadow, subButtonStyles.button]}
    >
      <Text style={styles.content}>{buttonLabel}</Text>
    </AnimatedPressable>
  );
};

export default function Home() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reanimated shared value to control expand/collapse
  const isExpanded = useSharedValue(false);

  // Modal for "Create Notification"
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationText, setNotificationText] = useState('');

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
      querySnapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setUsers(data);
    } catch (error) {
      console.error('Error fetching assigned users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle the main FAB
  const handlePressFAB = () => {
    isExpanded.value = !isExpanded.value;
  };

  // Animate the "+" icon itself (rotate 0→45°)
  const plusIconStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(Number(isExpanded.value), [0, 1], [0, 2]);
    const translateValue = withTiming(moveValue);
    const rotateValue = isExpanded.value ? '45deg' : '0deg';

    return {
      transform: [
        { translateX: translateValue },
        { rotate: withTiming(rotateValue) },
      ],
    };
  });

  // Open / close the "Create Notification" modal
  const openNotificationModal = () => {
    setShowNotificationModal(true);
  };
  const closeNotificationModal = () => {
    setShowNotificationModal(false);
    setNotificationText('');
  };

  // Create a new doc in Firestore for all "user" roles to see
  const handleSendNotification = async () => {
    try {
      if (!notificationText.trim()) {
        // If empty, just close
        closeNotificationModal();
        return;
      }
      await addDoc(collection(db, 'notifications'), {
        message: notificationText,
        createdAt: serverTimestamp(),
        toRole: 'user', // So user accounts know to retrieve it
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
          <ActivityIndicator size="large" color="#06402B" />
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
                  borderRadius: 8,
                }}
              >
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

        {/* FAB Section - pinned to bottom-right */}
        <View style={styles.fabContainer}>
          <View style={styles.fabColumn}>
            {/* Main FAB (+) */}
            <AnimatedPressable
              onPress={handlePressFAB}
              style={[styles.shadow, mainButtonStyles.button]}
            >
              <Animated.Text style={[plusIconStyle, mainButtonStyles.content]}>
                +
              </Animated.Text>
            </AnimatedPressable>

            {/* Sub-button 1: Create Workout (placeholder) */}
            <FloatingActionButton
              isExpanded={isExpanded}
              index={1}
              buttonLabel="Create Workout"
              onPress={() => {
                console.log('Create Workout tapped!');
                isExpanded.value = false;
              }}
            />
            {/* Sub-button 2: Create Notification => open modal */}
            <FloatingActionButton
              isExpanded={isExpanded}
              index={2}
              buttonLabel="Create Notification"
              onPress={() => {
                openNotificationModal();
                isExpanded.value = false;
              }}
            />
          </View>
        </View>

        {/* Notification Modal */}
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
                <Button title="Cancel" onPress={closeNotificationModal} />
                <View style={{ width: 20 }} />
                <Button title="Send" onPress={handleSendNotification} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

/* Purple main button */
const mainButtonStyles = StyleSheet.create({
  button: {
    zIndex: 2,
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: '#06402B',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    fontSize: 24,
    color: '#f8f9ff',
  },
});

/* Smaller sub-buttons */
const subButtonStyles = StyleSheet.create({
  button: {
    width: 120,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#82cab2',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
  },
});

/* Layout & shadows */
const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabColumn: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    overflow: 'visible',
  },
  shadow: {
    shadowColor: '#171717',
    shadowOffset: { width: -0.5, height: 3.5 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  content: {
    color: '#f8f9ff',
    fontWeight: '500',
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    minHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  textInput: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 8,
    borderRadius: 6,
    padding: 8,
  },
});
