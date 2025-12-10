import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { DEVICE_WIDTH } from '$constants/dimensions';
import { navigate } from '$helpers/navigationUtils';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ShoppingCartIcon,
  UserGroupIcon,
  HomeIcon,
  MicrophoneIcon,
  CubeIcon,
} from 'react-native-heroicons/solid';
import { CounterBadge } from '$components/common/badges/CounterBadge';

interface NavItem {
  name: string;
  icon: React.ComponentType<any>;
  route: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { name: 'Shop', icon: ShoppingCartIcon, route: 'ShopScreen', badge: 1 },
  { name: 'Friends', icon: UserGroupIcon, route: 'FriendsScreen', badge: 1 },
  { name: 'Home', icon: HomeIcon, route: 'HomeScreen' },
  { name: 'Clubs', icon: MicrophoneIcon, route: 'ClubsScreen' },
  { name: 'Chest', icon: CubeIcon, route: 'ChestScreen', badge: 1 },
];

const BottomNav: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const handleNavigate = (routeName: string) => {
    navigate(routeName as any, {});
  };

  const isActive = (routeName: string): boolean => {
    return route.name === routeName;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.darkPurpleBg + 'EE', COLORS.purpleGradientStart + 'DD']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.route);
          const isHome = item.name === 'Home';

          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, isHome && styles.homeNavItem]}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Icon
                  size={isHome ? 28 : 24}
                  color={active ? COLORS.gold : COLORS.white + '80'}
                />
                {item.badge && item.badge > 0 && (
                  <CounterBadge count={item.badge} style={styles.badge} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 10,
    borderTopWidth: 2,
    borderTopColor: COLORS.goldBorder + '40',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  homeNavItem: {
    // Home icon can be slightly larger
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
});

export default BottomNav;

