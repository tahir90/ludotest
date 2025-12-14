import { combineReducers } from "redux";
import { gameReducer } from "./reducers/gameSlice";
import userReducer from "./reducers/userSlice";
import shopReducer from "./reducers/shopSlice";
import clubReducer from "./reducers/clubSlice";
import socialReducer from "./reducers/socialSlice";
import leaderboardReducer from "./reducers/leaderboardSlice";
import giftingReducer from "./reducers/giftingSlice";
import notificationReducer from "./reducers/notificationSlice";

const RootReducer = combineReducers({
    game: gameReducer,
    user: userReducer,
    shop: shopReducer,
    club: clubReducer,
    social: socialReducer,
    leaderboard: leaderboardReducer,
    gifting: giftingReducer,
    notification: notificationReducer,
})

export default RootReducer;