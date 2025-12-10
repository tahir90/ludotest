import { combineReducers } from "redux";
import { gameReducer } from "./reducers/gameSlice";
import userReducer from "./reducers/userSlice";
import shopReducer from "./reducers/shopSlice";
import clubReducer from "./reducers/clubSlice";
import socialReducer from "./reducers/socialSlice";

const RootReducer = combineReducers({
    game: gameReducer,
    user: userReducer,
    shop: shopReducer,
    club: clubReducer,
    social: socialReducer,
})

export default RootReducer;