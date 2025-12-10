import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import TopNav from '$components/layout/TopNav';
import BottomNav from '$components/layout/BottomNav';
import { PrimaryButton } from '$components/common';
import { navigate } from '$helpers/navigationUtils';

const ChestScreen: React.FC = () => {
  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <TopNav title="Chest" showBack={true} />
      
      <View style={styles.container}>
        <Text style={styles.icon}>🎁</Text>
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.description}>
          The Chest feature is coming soon! Check back later for exciting rewards and prizes.
        </Text>
        <PrimaryButton
          title="Go Home"
          onPress={() => navigate('HomeScreen', {})}
          style={styles.button}
        />
      </View>

      <BottomNav />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  icon: {
    fontSize: RFValue(80),
    marginBottom: 20,
  },
  title: {
    color: COLORS.gold,
    fontSize: RFValue(28),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    textAlign: 'center',
    lineHeight: RFValue(24),
    marginBottom: 30,
  },
  button: {
    width: '80%',
  },
});

export default ChestScreen;

