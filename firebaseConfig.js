import { initializeApp } from "firebase/app";

import {getReactNativePersistence, initializeAuth} from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore, collection} from 'firebase/firestore'


// 1. create new project on firebase console
// 2. enable email and password auth provider in authentication
// 3. create a web app and copy the firebseConfigs below 

const firebaseConfig = {
  apiKey: "AIzaSyB9-46Wtt2XO0QiwNXibsACa6n42S3TqM0",
  authDomain: "thorgym-4d10e.firebaseapp.com",
  projectId: "thorgym-4d10e",
  storageBucket: "thorgym-4d10e.firebasestorage.app",
  messagingSenderId: "264722826374",
  appId: "1:264722826374:web:20ac77ef3e3b52e8aa7d07",
  measurementId: "G-TRQHR84FLL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export const usersRef = collection(db, 'users');
export const roomRef = collection(db, 'rooms');
