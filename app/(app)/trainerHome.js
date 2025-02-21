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
} from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../context/authContext';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { blurhash } from '../../utils/common';

// Reanimated imports
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

// Animate the Pressable
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Spring animation settings
const SPRING_CONFIG = {
  duration: 1200,
  overshootClamping: true,
  dampingRatio: 0.8,
};

// Distance to offset each expanded button
const OFFSET = 60;

/**
 * A single floating sub-button (e.g. Create Workout, Create Notification).
 */
const FloatingActionButton = ({ isExpanded, index, buttonLetter }) => {
  // Each sub-button slides upward and scales in
  const animatedStyles = useAnimatedStyle(() => {
    // e.g. index=1 => moves up 60, index=2 => 120, etc.
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
    <AnimatedPressable style={[animatedStyles, styles.shadow, subButtonStyles.button]}>
      <Text style={styles.content}>{buttonLetter}</Text>
    </AnimatedPressable>
  );
};

export default function Home() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reanimated shared value to control expand/collapse
  const isExpanded = useSharedValue(false);

  // Fetch assigned users on mount
  useEffect(() => {
    if (user?.uid) getUsers();
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
  const handlePress = () => {
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
            {/* Main FAB (purple +) */}
            <AnimatedPressable
              onPress={handlePress}
              style={[styles.shadow, mainButtonStyles.button]}
            >
              <Animated.Text style={[plusIconStyle, mainButtonStyles.content]}>
                +
              </Animated.Text>
            </AnimatedPressable>

            {/* Sub-buttons: "Create Workout" and "Create Notification" */}
            <FloatingActionButton
              isExpanded={isExpanded}
              index={1}
              buttonLetter={'Create Workout'}
            />
            <FloatingActionButton
              isExpanded={isExpanded}
              index={2}
              buttonLetter={'Create Notification'}
            />
          </View>
        </View>
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
    width: 150,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#06402BBF',
    display: 'flex',            // <-- Must be 'flex' not 'center'
    justifyContent: 'center',   // Center vertically
    alignItems: 'center',       // Center horizontally
    position: 'absolute',
    zIndex: 1, // ensure sub-buttons appear above other elements
  },
});

/* Layout & shadows */
const styles = StyleSheet.create({
  fabContainer: {
    // Anchor the entire group of buttons at bottom-right
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
});
