import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Wrapper from '$components/Wrapper'
import { styles } from './styles'
import { IMAGES } from '$assets/images'
import Dice from '$components/Dice'
import { COLORS } from '$constants/colors'
import Pocket from '$components/Pocket'
import VerticalPath from '$components/VerticalPath'
import { plot1data, plot2data, plot3data, plot4data } from '$helpers/PlotData'
import HorizontalPath from '$components/HorizontalPath'
import FourTriangle from '$components/FourTriangle'
import { useAppSelector } from '$hooks/useAppStore'
import { selectDiceTouch, selectPlayer1, selectPlayer2, selectPlayer3, selectPlayer4, selectFinalWinner, selectTotalPlayers, selectActivePlayers } from '$redux/reducers/gameSelectors'
import { useIsFocused } from '@react-navigation/native';
import { DEVICE_HEIGHT, DEVICE_WIDTH } from '$constants/dimensions'
import MenuModal from '$components/MenuModal'
import WinnerModal from '$components/WinnerModal'
import { SpeakerWaveIcon, SpeakerXMarkIcon } from 'react-native-heroicons/solid'
import { playSound, toggleMusicMute, stopSound } from '$helpers/SoundUtils'

const LudoBoardScreen = () => {

  const player1 = useAppSelector(selectPlayer1);
  const player2 = useAppSelector(selectPlayer2);
  const player3 = useAppSelector(selectPlayer3);
  const player4 = useAppSelector(selectPlayer4);
  const isDiceTouched = useAppSelector(selectDiceTouch);
  const finalWinner = useAppSelector(selectFinalWinner);
  const totalPlayers = useAppSelector(selectTotalPlayers);
  const activePlayers = useAppSelector(selectActivePlayers);

  const isFocused = useIsFocused();

  const [showStartIMG, setShowStartIMG] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if(isFocused){
      setShowStartIMG(true);
      // Start background music at reduced volume (0.2 = 20% volume for subtle background)
      playSound('home', true, 0.2);
      
      const blinkAnimation = Animated.loop(Animated.sequence([
        Animated.timing(opacity,{
          toValue : 0,
          duration : 500,
          useNativeDriver : true
        }),
        Animated.timing(opacity,{
          toValue : 1,
          duration : 500,
          useNativeDriver : true
        })
      ]));

      blinkAnimation.start();

      const timeout = setTimeout(() => {
        blinkAnimation.stop();
        setShowStartIMG(false);
      },2500);

      return () => {
        blinkAnimation.stop();
        clearTimeout(timeout);
        stopSound();
      }
    }
  },[isFocused])

  const handleMusicMuteToggle = () => {
    const muted = toggleMusicMute();
    setIsMusicMuted(muted);
  };

  return (
    <Wrapper>
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity
          style={styles.iconContainer}
          activeOpacity={0.6}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <Image
            source={IMAGES.Menu}
            style={{ width: 30, height: 30 }}
            resizeMode={'contain'}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.musicButton, isMusicMuted && styles.musicButtonMuted]}
          activeOpacity={0.6}
          onPress={handleMusicMuteToggle}
        >
          {isMusicMuted ? (
            <SpeakerXMarkIcon size={24} color={COLORS.error} />
          ) : (
            <SpeakerWaveIcon size={24} color={COLORS.gold} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.flexRow} pointerEvents={isDiceTouched ? 'none' : 'auto'}>
          <Dice color={COLORS.green} player={2} data={player2} />
          <Dice color={COLORS.yellow} rotate player={3} data={player3} />
        </View>

        <View style={styles.ludoBoardContainer}>
          <View style={styles.plotContainer}>
            <Pocket color={COLORS.green} player={2} data={player2} />
            <VerticalPath cells={plot2data} color={COLORS.yellow} player={2} />
            <Pocket color={COLORS.yellow} player={3} data={player3} />
          </View>

          <View style={styles.pathContainer}>
            <HorizontalPath cells={plot1data} color={COLORS.green} player={1} />
            <FourTriangle
              player1={player1}
              player2={player2}
              player3={player3}
              player4={player4}
            />
            <HorizontalPath cells={plot3data} color={COLORS.blue} player={3} />
          </View>

          <View style={styles.plotContainer}>
            <Pocket color={COLORS.red} player={1} data={player1} />
            <VerticalPath cells={plot4data} color={COLORS.red} player={4} />
            <Pocket color={COLORS.blue} player={4} data={player4} />
          </View>
        </View>

        <View style={styles.flexRow} pointerEvents={isDiceTouched ? 'none' : 'auto'}>
          <Dice color={COLORS.red} player={1} data={player1} />
          <Dice color={COLORS.blue} rotate player={4} data={player4} />
        </View>
      </View>

      {showStartIMG && (
        <Animated.Image
          source={IMAGES.Start}
          style={{ width: DEVICE_WIDTH * 0.5, height: DEVICE_WIDTH * 0.2, position: 'absolute', opacity }}
        />
      )}

      {
        menuVisible && <MenuModal visible={menuVisible} onPressHide={() => setMenuVisible(false)} />
      }

      {
        finalWinner !== null && <WinnerModal winner={finalWinner} />
      }
    </Wrapper>
  )
}

export default LudoBoardScreen