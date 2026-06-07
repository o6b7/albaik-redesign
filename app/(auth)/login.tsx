import { auth, db } from '@/firebase';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            setUser({
                uid: user.uid,
                email: user.email!,
                fullName: userData?.fullName ?? '',
                phone: userData?.phone,
            });
            router.replace('/(tabs)' as any);
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
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
                        <Text className="text-3xl font-bold text-gray-900 text-center mb-2">Welcome Back</Text>
                        <Text className="text-gray-400 text-center mb-10">Sign in to continue</Text>

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
                            className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 mb-10 text-base text-gray-900"
                            placeholder="Password"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <Pressable
                            className="bg-[#C0392B] rounded-2xl py-4 items-center mb-6"
                            onPress={handleLogin}
                            disabled={loading}
                            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Login</Text>
                            )}
                        </Pressable>

                        <View className="flex-row justify-center mt-auto">
                            <Text className="text-gray-400">Don't have an account? </Text>
                            <Pressable onPress={() => (router as any).push('/(auth)/register')}>
                                <Text className="text-[#C0392B] font-bold">Register</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
