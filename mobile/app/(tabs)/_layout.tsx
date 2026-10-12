import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary, headerShadowVisible: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Tổng quan', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="routines"
        options={{ title: 'Routines', tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="avatar"
        options={{ title: 'Nhân vật 3D', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
