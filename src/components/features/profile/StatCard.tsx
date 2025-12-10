import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  currentRank?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  currentRank,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradientPurple}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.title}>{title}</Text>
          {currentRank && (
            <Text style={styles.rank}>Current: {currentRank}</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
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
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 10,
  },
  value: {
    color: COLORS.gold,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    textAlign: 'center',
  },
  rank: {
    color: COLORS.lightText,
    fontSize: RFValue(10),
    fontFamily: 'Philosopher-Bold',
    marginTop: 5,
  },
});

