import { safeSpots, starSpots, startingPoints, turningPoints, victoryStart } from "$helpers/PlotData";
import { playSound } from "$helpers/SoundUtils";
import { ApplicationDispatch, RootState } from "$redux/store"
import { selectCurrentPosition, selectDiceNo } from "./gameSelectors";
import { announceWinner, disableTouch, unfreezeDice, updateFireworks, updatePlayerChance, updatePlayerPieceValue } from "./gameSlice";

const delay = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

const checkWinningCriteria = (pieces : any[]) => {
    for(let piece of pieces) {
        if(piece.travelCount < 57) {
            return false;
        }
    }
    return true;
}

export const handleForwardThunk = (playerNo: number, id: string, pos: number) => {
    return async (dispatch: ApplicationDispatch, getState: () => RootState) => {

        const state = getState();
        const plottedPieces = selectCurrentPosition(state);
        const diceNo = selectDiceNo(state);

        let alpha = playerNo === 1 ? "A" : playerNo === 2 ? "B" : playerNo === 3 ? "C" : "D";

        const peicesAtPosition: PLAYER_PIECE[] = plottedPieces.filter((e: PLAYER_PIECE) => e.pos === pos);
        const piece : PLAYER_PIECE = peicesAtPosition[peicesAtPosition.findIndex((e: PLAYER_PIECE) => e.id[0] == alpha)];

        dispatch(disableTouch())

        let finalPath = piece.pos;
        const beforePlayerPiece = state.game[`player${playerNo}`].find((e) => e.id === id);
        let travelCount = beforePlayerPiece?.travelCount!;

        for (let i = 0; i < diceNo; i++) {
            const updatedPosition = getState();
            const playerPiece = updatedPosition.game[`player${playerNo}`].find((e) => e.id === id);
            let path = playerPiece?.pos! + 1;
            if (turningPoints.includes(path) && turningPoints[playerNo - 1] == path) {
                path = victoryStart[playerNo - 1];
            }

            if (path == 53) {
                path = 1;
            }

            finalPath = path;
            travelCount += 1;

            dispatch(updatePlayerPieceValue({
                playerNo: `player${playerNo}`,
                pieceId: playerPiece?.id,
                pos: path,
                travelCount: travelCount
            }))
            playSound('pile_move')
            await delay(200);
        }

        const updatedState = getState();
        const updatedPlottedPieces: any[] = selectCurrentPosition(updatedState);
        const finalPlot = updatedPlottedPieces.filter((e) => e.pos == finalPath);
        const ids = finalPlot.map((e) => e.id[0]);

        const uniqueIDs = new Set<string>(ids);
        const areDifferentIds = uniqueIDs.size > 1;

        if (safeSpots.includes(finalPath) || starSpots.includes(finalPath)) {
            playSound('safe_spot');
        }

        if (
            areDifferentIds &&
            !safeSpots.includes(finalPath) &&
            !starSpots.includes(finalPath)
        ) {
            const enemyPiece = finalPlot.find((p) => p.id[0] !== id[0]);
            const enemyId = enemyPiece.id[0];
            let no = enemyId === 'A' ? 1 : enemyId === 'B' ? 2 : enemyId === 'C' ? 3 : 4;

            let backwordPath = startingPoints[no - 1];
            let i = enemyPiece.pos;
            playSound('collide');

            while (i !== backwordPath) {
                dispatch(updatePlayerPieceValue({
                    playerNo: `player${no}`,
                    pieceId: enemyPiece.id,
                    pos: i,
                    travelCount: 0
                }))

                await delay(0.4)
                i--;
                if (i === 0) {
                    i = 52;
                }
            }

            dispatch(updatePlayerPieceValue({
                playerNo: `player${no}`,
                pieceId: enemyPiece.id,
                pos: 0,
                travelCount: 0
            }))

            dispatch(unfreezeDice());
        }

        if (diceNo == 6 || travelCount == 57) {
            if (travelCount == 57) {
                playSound('home_win');
                const finalPlayerState = getState();
                const playerAllPieces = finalPlayerState.game[`player${playerNo}`];

                if (checkWinningCriteria(playerAllPieces)) {
                    dispatch(unfreezeDice());
                    dispatch(announceWinner(playerNo))
                    playSound('cheer');
                    
                    // Check if game should end
                    const updatedState = getState();
                    if (updatedState.game.finalWinner !== null) {
                        // Game ended - don't continue
                        return;
                    }
                    
                    // Game continues - skip this player and move to next non-winning player
                    const winners = updatedState.game.winners;
                    const activePlayers = updatedState.game.activePlayers;
                    const currentIndex = activePlayers.indexOf(playerNo);
                    let nextIndex = (currentIndex + 1) % activePlayers.length;
                    let nextPlayer = activePlayers[nextIndex];
                    
                    // Find next active, non-winning player
                    let attempts = 0;
                    while (winners.includes(nextPlayer) && attempts < activePlayers.length) {
                        nextIndex = (nextIndex + 1) % activePlayers.length;
                        nextPlayer = activePlayers[nextIndex];
                        attempts++;
                    }
                    
                    dispatch(updatePlayerChance({ chancePlayer: nextPlayer }));
                    return;
                }

                dispatch(updateFireworks(true));
                dispatch(unfreezeDice());
                // Player gets another turn for rolling 6 or reaching home
                dispatch(updatePlayerChance({ chancePlayer: playerNo }));
                return;
            }
        } else {
            // Skip winning players in turn rotation
            const currentState = getState();
            const winners = currentState.game.winners;
            const activePlayers = currentState.game.activePlayers;
            const currentIndex = activePlayers.indexOf(playerNo);
            let nextIndex = (currentIndex + 1) % activePlayers.length;
            let chancePlayer = activePlayers[nextIndex];
            
            // Find next active, non-winning player
            let attempts = 0;
            while (winners.includes(chancePlayer) && attempts < activePlayers.length) {
                nextIndex = (nextIndex + 1) % activePlayers.length;
                chancePlayer = activePlayers[nextIndex];
                attempts++;
            }
            
            dispatch(updatePlayerChance({ chancePlayer }))
        }
    }
}