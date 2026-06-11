import { DENSE_TEXT } from '@/lib/a11y';
import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';

export interface SegmentedTab {
  key: string;
  label: string;
  /** Optional badge count rendered next to the label. */
  count?: number;
  /** Accent for the active state and count badge; defaults to brand red. */
  color?: string;
}

/** iOS-style segmented control used to switch list views within a screen. */
export function SegmentedTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: SegmentedTab[];
  active: string;
  onChange: (key: string) => void;
}) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={{
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 18,
        backgroundColor: isDark ? '#1A1A1A' : '#F2F2F2',
        borderRadius: 14,
        padding: 4,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const accent = tab.color ?? '#C0392B';
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.8}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              paddingVertical: 9,
              borderRadius: 11,
              backgroundColor: isActive ? (isDark ? '#2E2E2E' : '#fff') : 'transparent',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isActive ? 0.08 : 0,
              shadowRadius: 4,
              elevation: isActive ? 2 : 0,
            }}
          >
            <Text
              {...DENSE_TEXT}
              style={{
                flexShrink: 1,
                fontSize: 13,
                fontWeight: isActive ? '700' : '600',
                color: isActive
                  ? isDark
                    ? '#F0F0F0'
                    : '#1a1a1a'
                  : isDark
                  ? '#777'
                  : '#999',
              }}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
            {tab.count !== undefined && tab.count > 0 && (
              <View
                style={{
                  minWidth: 18,
                  minHeight: 18,
                  borderRadius: 9,
                  paddingHorizontal: 5,
                  backgroundColor: isActive ? accent : isDark ? '#333' : '#E0E0E0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  {...DENSE_TEXT}
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    color: isActive ? '#fff' : isDark ? '#999' : '#777',
                  }}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
