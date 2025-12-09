import { initialState } from '$redux/initialState';
import { createSlice } from '@reduxjs/toolkit';

const gameSlice = createSlice({
    name: 'game',
    initialState: initialState,
    reducers: {
        resetGame: (state) => {
            Object.assign(state, initialState);
            // Reset activePlayers to default
            state.activePlayers = [1, 2, 3, 4];
            state.totalPlayers = 4;
        },
        updateDiceNumber: (state, action) => {
            state.diceNo = action.payload.diceNo;
            state.isDiceRolled = false;
        },
        enablePileSelection: (state, action) => {
            state.touchDiceBlock = true;
            state.pileSelectionPlayer = action.payload.playerNo;
        },
        enableCellSelection: (state, action) => {
            state.touchDiceBlock = true;
            state.cellSelectionPlayer = action.payload.playerNo;
        },
        disableTouch: (state) => {
            state.touchDiceBlock = true;
            state.pileSelectionPlayer = -1;
            state.cellSelectionPlayer = -1;
        },
        unfreezeDice: (state) => {
            state.touchDiceBlock = false;
            state.isDiceRolled = false;
        },
        updateFireworks: (state, action) => {
            state.fireworks = action.payload;
        },
        announceWinner: (state, action) => {
            const playerNo = action.payload;
            if (!state.winners.includes(playerNo)) {
                state.winners.push(playerNo);
            }
            // Check if game should end (only 1 active player left)
            const activePlayersCount = state.activePlayers.length;
            if (state.winners.length >= activePlayersCount - 1) {
                // Set the first winner as the final winner (champion)
                if (state.winners.length > 0) {
                    state.finalWinner = state.winners[0];
                }
            }
        },
        setTotalPlayers: (state, action) => {
            const playerCount = action.payload;
            state.totalPlayers = playerCount;
            
            // Randomly select active players based on count
            if (playerCount === 2) {
                // For 2 players: Randomly choose diagonal pairs
                // Board positions:
                //   Top-left: Player 2 (Green)
                //   Top-right: Player 3 (Yellow)
                //   Bottom-left: Player 1 (Red)
                //   Bottom-right: Player 4 (Blue)
                // Diagonal pairs:
                //   Option 1: [1, 3] - Bottom-left (Red) + Top-right (Yellow) - DIAGONAL
                //   Option 2: [2, 4] - Top-left (Green) + Bottom-right (Blue) - DIAGONAL
                const diagonalPairs = [[1, 3], [2, 4]];
                const randomIndex = Math.floor(Math.random() * diagonalPairs.length);
                state.activePlayers = diagonalPairs[randomIndex];
                console.log('🎲 2 Players - Selected diagonal pair:', state.activePlayers);
                // Set first active player as starting player
                state.chancePlayer = state.activePlayers[0];
            } else if (playerCount === 3) {
                // For 3 players: Randomly choose 3 out of 4 players
                const allPlayers = [1, 2, 3, 4];
                // Fisher-Yates shuffle for better randomness
                const shuffled = [...allPlayers];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                state.activePlayers = shuffled.slice(0, 3).sort((a, b) => a - b);
                console.log('🎲 3 Players - Selected players:', state.activePlayers);
                // Set first active player as starting player
                state.chancePlayer = state.activePlayers[0];
            } else {
                // For 4 players: All players are active
                state.activePlayers = [1, 2, 3, 4];
                state.chancePlayer = 1;
            }
        },
        updatePlayerChance: (state, action) => {
            state.chancePlayer = action.payload.chancePlayer;
            state.touchDiceBlock = false;
            state.isDiceRolled = false;
        },
        updatePlayerPieceValue: (state, action) => {
            const { playerNo, pieceId, pos, travelCount } = action.payload;
            const playerPieces : any[] = state[playerNo];
            const piece = playerPieces.find((p) => p.id === pieceId)
            state.pileSelectionPlayer = -1;

            if(piece){
                piece.pos = pos;
                piece.travelCount = travelCount;
                const currentPositionIdx = state.currentPosition.findIndex((p : any) => p.id === pieceId);

                if(pos === 0){
                    if(currentPositionIdx !== -1){
                        state.currentPosition.splice(currentPositionIdx,1);
                    }
                } else {
                    if(currentPositionIdx !== -1){
                        state.currentPosition[currentPositionIdx] = { id: pieceId, pos };
                    } else {
                        state.currentPosition.push({ id : pieceId, pos });
                    }
                }
            }
        }
    }
})

export const {
    resetGame,
    updateDiceNumber,
    enablePileSelection,
    enableCellSelection,
    disableTouch,
    unfreezeDice,
    updateFireworks,
    announceWinner,
    setTotalPlayers,
    updatePlayerChance,
    updatePlayerPieceValue
} = gameSlice.actions;
export const gameReducer = gameSlice.reducer;