// *** CHANGED ***: Now we fetch Firestore doc BEFORE setting `isAuthenticated=true`
// and store `role` (plus any other fields) in `user`.

import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            // If no user is signed in:
            if (!firebaseUser) {
                setIsAuthenticated(false);
                setUser(null);
            } else {
                // *** ADDED ***: Fetch the Firestore document for the newly signed-in user
                const docRef = doc(db, "users", firebaseUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // *** CHANGED ***: Combine the Firebase Auth user with Firestore fields
                    const data = docSnap.data();
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        ...data // includes username, profileUrl, role, userId, etc.
                    });
                } else {
                    // If doc doesn't exist, just store minimal info or handle error
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email
                        // or any defaults you want
                    });
                }

                // *** CHANGED ***: Only now set isAuthenticated to true
                setIsAuthenticated(true);
            }
        });
        return unsub;
    }, []);

    // *** CHANGED ***: We add a `role` argument to store in Firestore
    const register = async (email, password, username, profileUrl, role) => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);

            // *** ADDED ***: Store `role` in the Firestore doc
            await setDoc(doc(db, "users", response.user.uid), {
                userId: response.user.uid,
                username,
                profileUrl,
                role,
                hasSeenOnboarding: false
            });

            return { success: true, data: response.user };
        } catch (e) {
            let msg = e.message;
            if (msg.includes("(auth/invalid-email)")) msg = "Invalid email";
            if (msg.includes("(auth/email-already-in-use)")) msg = "This email is already in use";
            return { success: false, msg };
        }
    };

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (e) {
            let msg = e.message;
            if (msg.includes("(auth/invalid-email)")) msg = "Invalid email";
            if (msg.includes("(auth/invalid-credential)")) msg = "Wrong credentials";
            return { success: false, msg };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (e) {
            return { success: false, msg: e.message, error: e };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const value = useContext(AuthContext);
    if (!value) {
        throw new Error("useAuth must be wrapped inside AuthContextProvider");
    }
    return value;
};
