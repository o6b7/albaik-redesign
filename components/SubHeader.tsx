import { Text, TouchableOpacity, View } from 'react-native';


export function SubHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
    return (
        <View className='flex-row justify-between pb-2 pt-2'>
            <Text className='font-bold text-xl dark:text-white'>{title}</Text>
            <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
                <Text className='font-bold text-lg text-red-500'>See All</Text>
            </TouchableOpacity>
        </View>
    );
}
