import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: s.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem icon="home" label="Tổng quan" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem icon="barbell" label="Luyện tập" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="aipose"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem icon="hardware-chip" label="AI Coach" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem icon="stats-chart" label="Chỉ số" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem icon="people" label="Cộng đồng" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="avatar"
        options={{
          href: null, // Hidden from bottom tabs, accessed from Dashboard & Profile
        }}
      />
    </Tabs>
  );
}

function TabItem({
  icon,
  label,
  focused,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={[s.tabItem, focused && s.tabItemActive]}>
      <Ionicons
        name={focused ? icon : (`${icon}-outline` as any)}
        size={18}
        color={focused ? colors.primary : colors.muted}
      />
      <Text
        style={[s.tabLabel, focused ? s.tabLabelActive : s.tabLabelInactive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  tabBar: {
    height: 72,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    width: 66,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    fontSize: 10,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: colors.muted,
    fontWeight: '500',
  },
});
