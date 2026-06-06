import { auth, db } from '@/firebase';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function RegisterScreen() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullName || !email || !password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        setLoading(true);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);

            await setDoc(doc(db, 'users', user.uid), {
                fullName,
                email,
                phone: phone || null,
                createdAt: new Date().toISOString(),
            });

            setUser({
                uid: user.uid,
                email: user.email!,
                fullName,
                phone: phone || undefined,
            });

            router.replace('/(tabs)' as any);
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#C0392B]">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    {/* Logo Section */}
                    <View className="items-center pt-20 pb-10">
                        <Image
                            source={require('@/assets/images/loginLogo.png')}
                            className="w-56 h-28"
                            resizeMode="contain"
                        />
                    </View>

                    {/* Form Card */}
                    <View className="flex-1 bg-white rounded-t-[40px] px-8 pt-10 pb-8">
                        <Text className="text-3xl font-bold text-gray-900 text-center mb-2">Create Account</Text>
                        <Text className="text-gray-400 text-center mb-8">Sign up to get started</Text>

                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 mb-5 text-base text-gray-900"
                            placeholder="Full Name"
                            placeholderTextColor="#9CA3AF"
                            value={fullName}
                            onChangeText={setFullName}
                        />

                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 mb-5 text-base text-gray-900"
                            placeholder="Email"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 mb-5 text-base text-gray-900"
                            placeholder="Phone Number (optional)"
                            placeholderTextColor="#9CA3AF"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />

                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 mb-10 text-base text-gray-900"
                            placeholder="Password (at least 6 characters)"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <Pressable
                            className="bg-[#C0392B] rounded-2xl py-4 items-center mb-6"
                            onPress={handleRegister}
                            disabled={loading}
                            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Register</Text>
                            )}
                        </Pressable>

                        <View className="flex-row justify-center mt-auto">
                            <Text className="text-gray-400">Already have an account? </Text>
                            <Pressable onPress={() => router.back()}>
                                <Text className="text-[#C0392B] font-bold">Login</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
