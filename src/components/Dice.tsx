import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { memo, useEffect, useRef, useState } from 'react'
import { LinearGradient } from 'react-native-linear-gradient';
import { BackgroundImage } from '$helpers/GetIcon';
import LottieView from 'lottie-react-native';
import { ANIMATATIONS } from '$assets/animation';
import { IMAGES } from '$assets/images';
import { useAppDispatch, useAppSelector } from '$hooks/useAppStore';
import { selectCurrentPlayerChance, selectDiceNo, selectDiceRolled, selectWinners, selectTotalPlayers, selectFinalWinner, selectActivePlayers } from '$redux/reducers/gameSelectors';
import { enableCellSelection, enablePileSelection, updateDiceNumber, updatePlayerChance } from '$redux/reducers/gameSlice';
import { playSound } from '$helpers/SoundUtils';
import { COLORS } from '$constants/colors';

interface DiceProps {
    color: string;
    rotate?: boolean;
    player: number;
    data: PLAYER_PIECE[];
}

const Dice: React.FC<DiceProps> = ({ color, rotate, player, data }) => {

    const dispatch = useAppDispatch();

    const currentPlayerChance = useAppSelector(selectCurrentPlayerChance);
    const isDiceRolled = useAppSelector(selectDiceRolled);
    const diceNo = useAppSelector(selectDiceNo);
    const winners = useAppSelector(selectWinners);
    const totalPlayers = useAppSelector(selectTotalPlayers);
    const activePlayers = useAppSelector(selectActivePlayers);
    const finalWinner = useAppSelector(selectFinalWinner);
    const playerPieces: PLAYER_PIECE[] = useAppSelector((state: any) => state.game[`player${currentPlayerChance}`])

    const pileIcon = BackgroundImage.getImage(color);
    const diceIcon = BackgroundImage.getImage(diceNo);

    const arrowAnimation = useRef(new Animated.Value(0)).current;

    const [diceRolling, setDiceRolling] = useState<boolean>(false);

    useEffect(() => {
        function animateArrow() {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(arrowAnimation, {
                        toValue: 10,
                        duration: 600,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true
                    }),
                    Animated.timing(arrowAnimation, {
                        toValue: -10,
                        duration: 600,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true
                    })
                ])
            ).start()
        }

        animateArrow()
    }, [currentPlayerChance, isDiceRolled])

    const delay = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

    const handleDicePress = async (predice: number) => {

        const diceNumber = predice || Math.floor(Math.random() * 6) + 1;
        playSound('dice_roll');
        setDiceRolling(true)
        await delay(800);
        dispatch(updateDiceNumber({ diceNo: diceNumber }));
        setDiceRolling(false);
        const isAnyPieceAlive = data?.findIndex((e) => e.pos !== 0 && e.pos !== 57);
        const isAnyPieceLocked = data?.findIndex((e) => e.pos !== 0);

        if (isAnyPieceAlive == -1) {
            if (diceNumber === 6) {
                dispatch(enablePileSelection({ playerNo: player }))
            } else {
                // Skip winning players in turn rotation
                const currentIndex = activePlayers.indexOf(player);
                let nextIndex = (currentIndex + 1) % activePlayers.length;
                let chancePlayer = activePlayers[nextIndex];
                
                // Find next active, non-winning player
                let attempts = 0;
                while (winners.includes(chancePlayer) && attempts < activePlayers.length) {
                    nextIndex = (nextIndex + 1) % activePlayers.length;
                    chancePlayer = activePlayers[nextIndex];
                    attempts++;
                }
                
                await delay(600);
                dispatch(updatePlayerChance({ chancePlayer }))
            }
        } else {
            const canMove = playerPieces.some((pile) => pile.travelCount + diceNumber <= 57 && pile.pos !== 0)

            if (
                (!canMove && diceNumber === 6 && isAnyPieceLocked == -1) ||
                (!canMove && diceNumber !== 6 && isAnyPieceLocked != -1) ||
                (!canMove && diceNumber !== 6 && isAnyPieceLocked == -1)
            ) {
                // Skip winning players in turn rotation
                const currentIndex = activePlayers.indexOf(player);
                let nextIndex = (currentIndex + 1) % activePlayers.length;
                let chancePlayer = activePlayers[nextIndex];
                
                // Find next active, non-winning player
                let attempts = 0;
                while (winners.includes(chancePlayer) && attempts < activePlayers.length) {
                    nextIndex = (nextIndex + 1) % activePlayers.length;
                    chancePlayer = activePlayers[nextIndex];
                    attempts++;
                }
                
                await delay(600);
                dispatch(updatePlayerChance({ chancePlayer }))
                return
            }


            if (diceNumber === 6) {
                dispatch(enablePileSelection({ playerNo: player }));
            }
            dispatch(enableCellSelection({ playerNo: player }));
        }
    }


    return (
        <View style={[styles.flexRow, { transform: [{ scaleX: rotate ? -1 : 1 }] }]}>
            <View style={styles.border1}>
                <LinearGradient
                    style={styles.linearGradient}
                    colors={COLORS.gradientPurple}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                >
                    <View style={styles.pileContainer}>
                        <Image
                            source={pileIcon}
                            style={styles.pileIcon}
                        />
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.border2}>
                <LinearGradient
                    style={styles.diceGradient}
                    colors={[COLORS.lightPurple, COLORS.primaryPurple, COLORS.lightPurple]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                >
                    <View style={styles.diceContainer}>
                        {((currentPlayerChance === player) && !diceRolling && finalWinner === null && !winners.includes(player) && activePlayers.includes(player)) && (
                            <TouchableOpacity
                                disabled={isDiceRolled}
                                activeOpacity={0.5}
                                onPress={() => handleDicePress(0)}
                                onLongPress={() => handleDicePress(6)}
                            >
                                <Image
                                    source={diceIcon}
                                    style={styles.diceIcon}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </LinearGradient>
            </View>

            {
                (diceRolling) &&
                <LottieView
                    source={ANIMATATIONS['Diceroll']}
                    loop={false}
                    autoPlay={true}
                    style={styles.rollingDice}
                    cacheComposition={true}
                    hardwareAccelerationAndroid={true}
                />
            }

            {((currentPlayerChance === player) && !isDiceRolled && finalWinner === null && !winners.includes(player) && activePlayers.includes(player)) &&
                <Animated.View style={{ transform: [{ translateX: arrowAnimation }] }}>
                    <Image
                        source={IMAGES.Arrow}
                        style={{ width: 50, height: 30 }}
                    />
                </Animated.View>
            }
        </View>
    )
}

export default memo(Dice)

const styles = StyleSheet.create({
    flexRow: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    border1: {
        borderWidth: 3,
        borderRightWidth: 0,
        borderColor: COLORS.goldBorder
    },
    border2: {
        borderWidth: 3,
        padding: 1,
        backgroundColor: COLORS.lightPurple,
        borderRadius: 10,
        borderLeftWidth: 3,
        borderColor: COLORS.lightPurple
    },
    linearGradient: {

    },
    pileIcon: {
        width: 30,
        height: 30,
    },
    pileContainer: {
        paddingHorizontal: 3,
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center'
    },
    diceContainer: {
        backgroundColor: COLORS.lightPink,
        borderWidth: 1,
        borderRadius: 5,
        width: 55,
        height: 55,
        paddingVertical: 4,
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    diceGradient: {
        borderWidth: 3,
        borderLeftWidth: 3,
        borderColor: COLORS.goldBorder,
        justifyContent: 'center',
        alignItems: 'center'
    },
    diceIcon: {
        height: 45,
        width: 45
    },
    rollingDice: {
        height: 80,
        width: 80,
        zIndex: 99,
        top: -19,
        left: 38,
        position: 'absolute'
    }
})