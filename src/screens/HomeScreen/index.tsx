import { Animated, Text, Image, ScrollView, Pressable, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Wrapper from '$components/Wrapper';
import { IMAGES } from '$assets/images';
import { styles } from './styles';
import GradientButton from '$components/GradientButton';
import { useAppDispatch } from '$hooks/useAppStore';
import { resetGame, setTotalPlayers } from '$redux/reducers/gameSlice';
import { playSound, stopSound } from '$helpers/SoundUtils';
import { useSelector } from 'react-redux';
import { selectCurrentPosition } from '$redux/reducers/gameSelectors';
import { useIsFocused } from '@react-navigation/native';
import { navigate } from '$helpers/navigationUtils';
import LottieView from 'lottie-react-native';
import { ANIMATATIONS } from '$assets/animation';
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '$constants/dimensions';
import ResourceBar from '$components/layout/ResourceBar';
import BottomNav from '$components/layout/BottomNav';
import { ProfileSection } from '$components/features/home/ProfileSection';
import { StreakSection } from '$components/features/home/StreakSection';
import { GameModeCard } from '$components/features/home/GameModeCard';
import { QuickActionCard } from '$components/features/home/QuickActionCard';
import { useUser } from '$hooks/useUser';
import {
  TrophyIcon,
  LockClosedIcon,
  VideoCameraIcon,
  CubeIcon,
  UserPlusIcon,
} from 'react-native-heroicons/solid';
import { COLORS } from '$constants/colors';

const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const currentPosition = useSelector(selectCurrentPosition);
  const isFocused = useIsFocused();

  const withAnim = useRef(new Animated.Value(-DEVICE_WIDTH)).current;
  const scaleXAnim = useRef(new Animated.Value(-1)).current;

  const [streakProgress] = useState(0);
  const [streakTarget] = useState(100);
  const { user: currentUser } = useUser();

  useEffect(() => {
    if (isFocused) {
      // Restore full volume on home screen - NEVER restart music
      // If music is already playing, it will just adjust volume
      // If not playing, it will start
      playSound('home', true, 1.0).catch(err => console.error('Error adjusting music:', err));
    }
    return () => {
      // Don't stop music when leaving home - let it continue playing
      // Only stop when explicitly needed (like app close)
    };
  }, [isFocused]);

  useEffect(() => {
    const loopAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(withAnim, {
              toValue: DEVICE_WIDTH * 0.02,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleXAnim, {
              toValue: -1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(3000),
          Animated.parallel([
            Animated.timing(withAnim, {
              toValue: DEVICE_WIDTH * 2,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleXAnim, {
              toValue: -1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(withAnim, {
              toValue: -DEVICE_WIDTH * 0.05,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleXAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(3000),
          Animated.parallel([
            Animated.timing(withAnim, {
              toValue: -DEVICE_WIDTH * 2,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleXAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    const cleanUpAnimation = () => {
      Animated.timing(withAnim).stop();
      Animated.timing(scaleXAnim).stop();
    };

    loopAnimation();

    return cleanUpAnimation;
  }, [withAnim, scaleXAnim]);

  const renderButton = useCallback((title: string, onPress: () => void) => {
    return <GradientButton title={title} onPress={onPress} />;
  }, []);

  const startGame = async (e: boolean = false, playerCount?: number) => {
    stopSound();
    if (e) {
      dispatch(resetGame());
      if (playerCount) {
        dispatch(setTotalPlayers(playerCount));
      }
    }
    navigate('LudoBoardScreen', {});
    playSound('game_start');
  };

  const handleNewGame = useCallback(() => {
    startGame(true, 4);
  }, []);

  const handleResumeGame = useCallback(() => {
    startGame(false);
  }, []);

  const handle2Players = useCallback(() => {
    startGame(true, 2);
  }, []);

  const handle3Players = useCallback(() => {
    startGame(true, 3);
  }, []);

  const handleComingSoon = useCallback(() => {
    // Placeholder for coming soon features
  }, []);

  const handleGameModePress = (mode: string) => {
    if (mode === '2 Player') {
      handle2Players();
    } else if (mode === '4 Player') {
      handleNewGame();
    } else {
      handleComingSoon();
    }
  };

  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <ResourceBar />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        {currentUser && <ProfileSection user={currentUser} />}

        {/* Streak Section */}
        <StreakSection
          currentStreak={streakProgress}
          targetStreak={streakTarget}
          timeRemaining="2d 0h"
        />

        {/* Quick Actions Row */}
        <View style={styles.quickActionsRow}>
          <QuickActionCard
            title=""
            value="3 1 2"
            icon={<TrophyIcon size={30} color={COLORS.gold} />}
            onPress={() => navigate('LeaderboardScreen', {})}
          />
          <QuickActionCard
            title="MEGA WIN"
            value=""
            icon={<TrophyIcon size={30} color={COLORS.gold} />}
            onPress={handleComingSoon}
            locked={true}
            timer="11h 23m"
          />
        </View>

        {/* Game Modes Grid */}
        <View style={styles.gameModesContainer}>
          <View style={styles.gameModesRow}>
            <GameModeCard
              title="2 Player"
              icon={
                <View style={styles.numberIconWrapper}>
                  <Text style={styles.gameModeNumber}>2</Text>
                </View>
              }
              onPress={() => handleGameModePress('2 Player')}
            />
            <GameModeCard
              title="4 Player"
              icon={
                <View style={styles.numberIconWrapper}>
                  <Text style={styles.gameModeNumber}>4</Text>
                </View>
              }
              onPress={() => handleGameModePress('4 Player')}
            />
          </View>
          <View style={styles.gameModesRow}>
            <GameModeCard
              title="Private Table"
              icon={
                <View style={styles.emojiIconWrapper}>
                  <Text style={styles.gameModeIcon}>🎲</Text>
                </View>
              }
              onPress={handleComingSoon}
            />
            <GameModeCard
              title="VIP"
              icon={<TrophyIcon size={40} color={COLORS.gold} />}
              onPress={handleComingSoon}
              locked={true}
            />
          </View>
          <View style={styles.gameModesRow}>
            <GameModeCard
              title="Streak Stars"
              icon={<TrophyIcon size={40} color={COLORS.gold} />}
              onPress={handleComingSoon}
              timer="2d 0h"
            />
          </View>
        </View>

        {/* Legacy Buttons (Hidden by default, can be shown if needed) */}
        {false && (
          <View style={styles.legacyButtons}>
            {currentPosition.length !== 0 && renderButton('RESUME', handleResumeGame)}
            {renderButton('NEW GAME', handleNewGame)}
            {renderButton('2 Players', handle2Players)}
            {renderButton('3 Players', handle3Players)}
            {renderButton('VS Computer', handleComingSoon)}
            {renderButton('2 vs 2', handleComingSoon)}
          </View>
        )}

        {/* Activity Side Buttons */}
        <View style={styles.activityButtons}>
          <Pressable style={styles.activityButton} onPress={() => navigate('HomeScreen', {})}>
            <VideoCameraIcon size={24} color={COLORS.white} />
            <View style={styles.activityBadge}>
              <Text style={styles.activityBadgeText}>6</Text>
            </View>
          </Pressable>
          <Pressable style={styles.activityButton} onPress={() => navigate('ChestScreen', {})}>
            <CubeIcon size={24} color={COLORS.white} />
          </Pressable>
          <Pressable style={styles.activityButton} onPress={() => navigate('ClubsScreen', {})}>
            <Text style={styles.activityIcon}>🦖</Text>
            <View style={styles.activityBadge}>
              <Text style={styles.activityBadgeText}>6</Text>
            </View>
          </Pressable>
          <Pressable style={styles.activityButton} onPress={() => navigate('FriendsScreen', {})}>
            <UserPlusIcon size={24} color={COLORS.white} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Witch Animation (Preserved) */}
      <Animated.View
        style={[
          styles.witchContainer,
          { transform: [{ translateX: withAnim }, { scaleX: scaleXAnim }] },
        ]}
      >
        <Pressable
          onPress={() => {
            const soundName: any = `sound_girl${Math.floor(Math.random() * 4)}`;
            playSound(soundName);
          }}
        >
          <LottieView
            hardwareAccelerationAndroid
            source={ANIMATATIONS.Witch}
            autoPlay
            loop
            speed={1}
            style={styles.witch}
          />
        </Pressable>
      </Animated.View>

      <BottomNav />
    </Wrapper>
  );
};

export default HomeScreen;
