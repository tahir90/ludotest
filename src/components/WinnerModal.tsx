
import React, { memo, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import GradientButton from './GradientButton';
import Pile from './Pile';
import { announceWinner, resetGame, setTotalPlayers } from '../redux/reducers/gameSlice';
import { playSound } from '$helpers/SoundUtils';
import { resetAndNavigate } from '$helpers/navigationUtils';
import { ANIMATATIONS } from '$assets/animation';
import { COLORS } from '$constants/colors';

const WinnerModal: React.FC<{ winner: any }> = ({ winner }) => {

    const dispatch = useDispatch();
    const [visible, setVisible] = useState(!!winner);

    useEffect(() => {
        setVisible(!!winner);
    }, [winner]);

    const handleNewGame = () => {
        dispatch(resetGame());
        playSound('game_start');
    };

    const handleHome = () => {
        dispatch(resetGame());
        resetAndNavigate('HomeScreen');
    };

    console.log("winner",winner)

    return (
        <Modal
            style={styles.modal}
            isVisible={visible}
            backdropColor={COLORS.darkPurpleBg}
            backdropOpacity={0.85}
            onBackdropPress={() => { }}
            animationIn="zoomIn"
            animationOut="zoomOut"
            onBackButtonPress={() => { }}
        >
            <LinearGradient
                colors={COLORS.gradientDark}
                style={styles.gradientContainer}
            >
                <View style={styles.content}>
                    <View style={styles.pileContainer}>
                        <Pile 
                            player={winner} 
                            color={winner === 1 ? COLORS.red : winner === 2 ? COLORS.green : winner === 3 ? COLORS.yellow : COLORS.blue}
                            cell={false}
                            pieceId={`${winner === 1 ? 'A' : winner === 2 ? 'B' : winner === 3 ? 'C' : 'D'}1`}
                            onPress={() => {}}
                        />
                    </View>

                    <Text style={styles.congratsText}> Congratulations! PLAYER {winner}</Text>
                    <LottieView
                        autoPlay
                        hardwareAccelerationAndroid
                        loop={false}
                        source={ANIMATATIONS.Tropy}
                        style={styles.trophyAnimation}
                    />
                    <LottieView
                        autoPlay
                        hardwareAccelerationAndroid
                        loop={false}
                        source={ANIMATATIONS.Firework}
                        style={styles.fireworkAnimation}
                    />
                    <GradientButton title='NEW GAME' onPress={handleNewGame} />
                    <GradientButton title='HOME' onPress={handleHome} />
                </View>
            </LinearGradient>
            <LottieView
                autoPlay
                hardwareAccelerationAndroid
                loop={false}
                source={ANIMATATIONS.Girl}
                style={styles.girlAnimation}
            />
        </Modal>
    )
}

export default memo(WinnerModal);

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    gradientContainer: {
        borderRadius: 20,
        padding: 20,
        width: '96%',
        borderWidth: 2,
        borderColor: COLORS.goldBorder,
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        width: '96%',
        alignItems: 'center'
    },
    trophyAnimation: {
        height: 200,
        width: 200,
        marginTop: 20
    },
    fireworkAnimation: {
        width: 200,
        height: 500,
        marginTop: 20,
        position: 'absolute',
        zIndex: -1
    },
    girlAnimation: {
        width: 380,
        height: 500,
        marginTop: 20,
        position: 'absolute',
        bottom: -500,
        right: -120,
        zIndex: 99
    },
    pileContainer: {
        width: 90,
        height: 40,
    },
    congratsText: {
        fontSize: 18,
        color: COLORS.white,
        fontFamily: 'Philosopher-Bold',
        marginTop: 10
    }
});