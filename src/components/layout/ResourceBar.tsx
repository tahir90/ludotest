import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { DEVICE_WIDTH } from '$constants/dimensions';
import { navigate } from '$helpers/navigationUtils';
import { useUser } from '$hooks/useUser';
import { Cog6ToothIcon, PlusIcon } from 'react-native-heroicons/solid';

const ResourceBar: React.FC = () => {
  const { user: currentUser, crowns, level } = useUser();
  
  if (!currentUser) {
    return null;
  }
  
  const handleProfilePress = () => {
    navigate('ProfileScreen', {});
  };

  const handleCrownsPress = () => {
    navigate('ShopScreen', {});
  };

  const handleSettingsPress = () => {
    navigate('SettingsScreen', {});
  };

  const formatCrowns = (crowns: number): string => {
    if (crowns >= 1000000) {
      return `${(crowns / 1000000).toFixed(2)}M`;
    }
    if (crowns >= 1000) {
      return `${(crowns / 1000).toFixed(2)}K`;
    }
    return crowns.toString();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.darkPurpleBg + 'EE', COLORS.purpleGradientStart + 'DD']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {/* Level/XP */}
        <View style={styles.levelContainer}>
          <Text style={styles.levelIcon}>⭐</Text>
          <Text style={styles.levelText}>{level}</Text>
        </View>

        {/* Profile Avatar */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleProfilePress}
          activeOpacity={0.8}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Crowns */}
        <TouchableOpacity
          style={styles.crownsContainer}
          onPress={handleCrownsPress}
          activeOpacity={0.8}
        >
          <Text style={styles.crownIcon}>👑</Text>
          <Text style={styles.crownsText}>{formatCrowns(crowns)}</Text>
          <TouchableOpacity
            style={styles.plusButton}
            onPress={handleCrownsPress}
            activeOpacity={0.8}
          >
            <PlusIcon size={16} color={COLORS.success} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          style={styles.settingsContainer}
          onPress={handleSettingsPress}
          activeOpacity={0.8}
        >
          <Cog6ToothIcon size={24} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 60,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground + '80',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.goldBorder + '60',
  },
  levelIcon: {
    fontSize: RFValue(18),
    marginRight: 5,
  },
  levelText: {
    color: COLORS.gold,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  avatarContainer: {
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryPurple,
    borderWidth: 2,
    borderColor: COLORS.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  crownsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    backgroundColor: COLORS.cardBackground + '80',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.goldBorder + '60',
  },
  crownIcon: {
    fontSize: RFValue(18),
    marginRight: 8,
  },
  crownsText: {
    flex: 1,
    color: COLORS.gold,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  plusButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContainer: {
    marginLeft: 10,
    padding: 5,
  },
});

export default ResourceBar;

