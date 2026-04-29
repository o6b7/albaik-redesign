import { Text, View } from 'react-native';


export function SubHeader({ title }: { title: string }) {
    return (
        <View className='flex-row justify-between px-4 pb-2'>
            <Text className='font-bold text-xl'>{title}</Text>
            <Text className='font-bold text-lg text-red-500'>See All</Text>
        </View>
    );
}
