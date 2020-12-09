import {
    CLEAR_USERS,
    GET_USERS_FAILURE,
    GET_USERS_START,
    GET_USERS_SUCCESS,
    UPDATE_USER_SUCCESS
} from "../Actions/ActionTypes";
import {getInitialAsyncContainer} from "../Utils/Utils";
import {cloneDeep} from "lodash";

/**
 * Редюсер для узла "users".
 */
export default function users(state = getInitialAsyncContainer(), action) {
    switch (action.type) {
        case CLEAR_USERS:
            return getInitialAsyncContainer();
        case GET_USERS_START:
            return {
                data: null,
                isLoading: true,
                error: null
            };
        case GET_USERS_SUCCESS:
            return {
                data: action.payload,
                isLoading: false,
                error: null,
            };
        case GET_USERS_FAILURE:
            return {
                data: null,
                isLoading: false,
                error: action.payload.response
            };
        case UPDATE_USER_SUCCESS:
            const newUsers = cloneDeep(state.data);

            for (let i = 0; i < newUsers.length; i++) {
                const user = newUsers[i];

                if (user._id === action.payload._id) {
                    user.favouriteMovies = action.payload.favouriteMovies;
                    break;
                }
            }

            return {
                data: newUsers,
                isLoading: false,
                error: null,
            };
        default:
            return state;
    }
}