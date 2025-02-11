import { View, Text, Image, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { Feather, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Loading from '../components/Loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';

export default function SignUp() {
    const router = useRouter();
    const {register} = useAuth();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('user');

    const emailRef = useRef('');
    const passwordRef = useRef('');
    const usernameRef = useRef('');



    const handleRegister = async ()=>{
        if(!emailRef.current || !passwordRef.current || !usernameRef.current){
            Alert.alert('Sign Up', "Please fill all the fields!");
            return;
        }
        setLoading(true);

        const uniqueKey = usernameRef.current.trim() || Math.random().toString(36).substring(7);
        const fallbackAvatarUrl = `https://api.dicebear.com/6.x/bottts/svg?seed=${encodeURIComponent(uniqueKey)}`;

        let response = await register(
            emailRef.current,
            passwordRef.current,
            usernameRef.current,
            fallbackAvatarUrl,
            role
        );
        setLoading(false);

        console.log('got result: ', response);
        if(!response.success){
            Alert.alert('Sign Up', response.msg);
        }
    }
  return (
    <CustomKeyboardView>
      <StatusBar style="dark" />
      <View style={{paddingTop: hp(7), paddingHorizontal: wp(5)}} className="flex-1 gap-12">
        {/* signIn image */}
        <View className="items-center">
            <Image style={{height: hp(20)}} resizeMode='contain' source={require('../assets/images/register.png')} />
        </View>


        <View className="gap-10">
            <Text style={{fontSize: hp(4)}} className="font-bold tracking-wider text-center text-neutral-800">Sign Up</Text>
            {/* inputs */}
            <View className="gap-4">
                <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl">
                    <Feather name="user" size={hp(2.7)} color="gray" />
                    <TextInput
                        onChangeText={value=> usernameRef.current=value}
                        style={{fontSize: hp(2)}}
                        className="flex-1 font-semibold text-neutral-700"
                        placeholder='Username'
                        placeholderTextColor={'gray'}
                    />
                </View>
                
                <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl">
                    <Octicons name="mail" size={hp(2.7)} color="gray" />
                    <TextInput
                        onChangeText={value=> emailRef.current=value}
                        style={{fontSize: hp(2)}}
                        className="flex-1 font-semibold text-neutral-700"
                        placeholder='Email address'
                        placeholderTextColor={'gray'}
                    />
                </View>
                <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl">
                    <Octicons name="lock" size={hp(2.7)} color="gray" />
                    <TextInput
                        onChangeText={value=> passwordRef.current=value}
                        style={{fontSize: hp(2)}}
                        className="flex-1 font-semibold text-neutral-700"
                        placeholder='Password'
                        secureTextEntry
                        placeholderTextColor={'gray'}
                    />
                </View>

                <View style={{ flexDirection: 'row', gap: wp(10), marginVertical: hp(2) }}>
                    <TouchableOpacity
                        onPress={() => setRole('user')}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <View
                            style={{
                                height: 20,
                                width: 20,
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: role === 'user' ? '#4F46E5' : '#ccc',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 8,
                            }}
                        >
                            {role === 'user' && (
                                <View
                                    style={{
                                        height: 10,
                                        width: 10,
                                        borderRadius: 5,
                                        backgroundColor: '#4F46E5',
                                    }}
                                />
                            )}
                        </View>
                        <Text>Operator</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setRole('trainer')}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <View
                            style={{
                                height: 20,
                                width: 20,
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: role === 'trainer' ? '#4F46E5' : '#ccc',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 8,
                            }}
                        >
                            {role === 'trainer' && (
                                <View
                                    style={{
                                        height: 10,
                                        width: 10,
                                        borderRadius: 5,
                                        backgroundColor: '#4F46E5',
                                    }}
                                />
                            )}
                        </View>
                        <Text>Trainer</Text>
                    </TouchableOpacity>
                </View>
                    

                {/* submit button */}

                <View>
                    {
                        loading? (
                            <View className="flex-row justify-center">
                                <Loading size={hp(6.5)} />
                            </View>
                        ):(
                            <TouchableOpacity onPress={handleRegister} style={{height: hp(6.5)}} className="bg-indigo-500 rounded-xl justify-center items-center">
                                <Text style={{fontSize: hp(2.7)}} className="text-white font-bold tracking-wider">
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        )
                    }
                </View>

                

                {/* sign up text */}

                <View className="flex-row justify-center">
                    <Text style={{fontSize: hp(1.8)}} className="font-semibold text-neutral-500">Already have an account? </Text>
                    <Pressable onPress={()=> router.push('signIn')}>
                        <Text style={{fontSize: hp(1.8)}} className="font-bold text-indigo-500">Sign In</Text>
                    </Pressable>
                    
                </View>
                
            </View>
            
        </View>
      </View>
    </CustomKeyboardView>
  )
}