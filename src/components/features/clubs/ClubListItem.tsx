import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { Club } from '$types';
import { MicrophoneIcon } from 'react-native-heroicons/solid';

interface ClubListItemProps {
  club: Club;
  onPress: () => void;
}

export const ClubListItem: React.FC<ClubListItemProps> = ({ club, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={COLORS.gradientPurple}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {club.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{club.name}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {club.description}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MicrophoneIcon size={16} color={COLORS.gold} />
                <Text style={styles.statText}>
                  {club.memberCount}/{club.maxMembers}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.crownIcon}>👑</Text>
                <Text style={styles.statText}>
                  {club.totalCrowns.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  gradient: {
    padding: 2,
    borderRadius: 15,
  },
  content: {
    backgroundColor: COLORS.cardBackground + 'EE',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    padding: 15,
    flexDirection: 'row',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryPurple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.goldBorder,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: RFValue(24),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    color: COLORS.white,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    color: COLORS.lightText,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    color: COLORS.gold,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    marginLeft: 5,
  },
  crownIcon: {
    fontSize: RFValue(14),
  },
});

