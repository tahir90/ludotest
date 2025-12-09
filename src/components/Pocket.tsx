import { StyleSheet, View } from 'react-native'
import React, { memo, useCallback } from 'react'
import { COLORS } from '$constants/colors';
import Pile from './Pile';
import { useAppDispatch, useAppSelector } from '$hooks/useAppStore';
import { unfreezeDice, updatePlayerPieceValue, updatePlayerChance, disableTouch } from '$redux/reducers/gameSlice';
import { startingPoints } from '$helpers/PlotData';
import { selectActivePlayers, selectDiceNo } from '$redux/reducers/gameSelectors';

interface PocketProps {
    color: string;
    player: number;
    data: PLAYER_PIECE[];
}

interface PlotProps {
    color: string;
    player: number;
    pieceNo: number;
    data: PLAYER_PIECE[];
    onPress: (e: PLAYER_PIECE) => void;
}

const Pocket: React.FC<PocketProps> = ({ color, player, data }) => {

    const dispatch = useAppDispatch();
    const activePlayers = useAppSelector(selectActivePlayers);
    const diceNo = useAppSelector(selectDiceNo);
    
    // For inactive players, show structure but no tokens
    const isActive = activePlayers.includes(player);
    const displayData = isActive ? data : []; // Empty data for inactive players

    const handlePress = useCallback((value: PLAYER_PIECE) => {
        let playerNo: any = value.id.at(0);
        let numericPlayerNo: number;
        switch (playerNo) {
            case 'A':
                playerNo = 'player1';
                numericPlayerNo = 1;
                break;
            case 'B':
                playerNo = 'player2';
                numericPlayerNo = 2;
                break;
            case 'C':
                playerNo = 'player3';
                numericPlayerNo = 3;
                break;
            case 'D':
                playerNo = 'player4';
                numericPlayerNo = 4;
                break;
        }

        // Disable touch to prevent double-clicks and disable cell selection
        dispatch(disableTouch());

        dispatch(updatePlayerPieceValue({
            playerNo,
            pieceId: value.id,
            pos: startingPoints[parseInt(playerNo.match(/\d+/)[0], 10) - 1],
            travelCount: 1
        }))

        // If dice was 6, player gets another turn
        // Disable cell selection so tokens can't be moved with this 6
        // Visible dice still shows 6, but clicking dice will reroll
        if (diceNo === 6) {
            dispatch(unfreezeDice());
            // Give player another turn - they can reroll
            dispatch(updatePlayerChance({ chancePlayer: numericPlayerNo }));
        } else {
            // This shouldn't happen normally (pile selection only for 6)
            dispatch(unfreezeDice());
        }
    }, [diceNo, dispatch]);

    return (
        <View style={[styles.container, { backgroundColor: color }]}>
            <View style={styles.childFrame}>
                <View style={styles.flexRow}>
                    <Plot
                        pieceNo={0}
                        player={player}
                        color={color}
                        data={displayData}
                        onPress={handlePress}
                    />
                    <Plot
                        pieceNo={1}
                        player={player}
                        color={color}
                        data={displayData}
                        onPress={handlePress}
                    />
                </View>
                <View style={styles.flexRow}>
                    <Plot
                        pieceNo={2}
                        player={player}
                        color={color}
                        data={displayData}
                        onPress={handlePress}
                    />
                    <Plot
                        pieceNo={3}
                        player={player}
                        color={color}
                        data={displayData}
                        onPress={handlePress}
                    />
                </View>
            </View>
        </View>
    )
}

const Plot: React.FC<PlotProps> = ({ color, player, pieceNo, data, onPress }) => {
    return (
        <View style={[styles.plot, { backgroundColor: color }]}>
            {data && data[pieceNo]?.pos === 0 && (
                <Pile
                    color={color}
                    player={player!}
                    cell={false}
                    pieceId={data[pieceNo].id}
                    onPress={() => onPress(data[pieceNo])}
                />
            )}
        </View>
    )
}

export default memo(Pocket);

const styles = StyleSheet.create({
    container: {
        width: '40%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.4
    },
    childFrame: {
        backgroundColor: COLORS.white,
        width: '70%',
        height: '70%',
        borderColor: COLORS.goldBorder,
        padding: 15,
        borderWidth: 0.5,
        gap: 20
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '40%'
    },
    plot: {
        height: '80%',
        width: '36%',
        borderRadius: 100
    }
})