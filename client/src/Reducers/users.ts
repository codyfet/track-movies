import {IClientUser} from "./../Interfaces/User";
import {IUsersReduxState} from "./users.types";
import {
    CLEAR_USERS,
    GET_USERS_FAILURE,
    GET_USERS_START,
    GET_USERS_SUCCESS,
    UPDATE_USER_SUCCESS,
} from "../Actions/ActionTypes";
import {getInitialAsyncContainer} from "../Utils/Utils";
import {cloneDeep} from "lodash";
import {IFSAAction} from "../Interfaces/Common";
import {IClientUsers} from "../Interfaces/IUsers";
import {Reducer} from "redux";

type UsersAction = IFSAAction<any>; // TODO: Расписать все возможные экшены.

const initialState: IUsersReduxState = getInitialAsyncContainer<IClientUsers>();

/**
 * Редюсер для узла "users".
 */
const usersReducer: Reducer<IUsersReduxState> = (state = initialState, action: UsersAction) => {
    switch (action.type) {
        case CLEAR_USERS:
            return initialState;
        case GET_USERS_START:
            return {
                data: null,
                isLoading: true,
                error: null,
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
                error: action.payload.response,
            };
        case UPDATE_USER_SUCCESS:
            const newUsersData = cloneDeep(state.data);
            const {items} = newUsersData;

            for (let i = 0; i < items.length; i++) {
                const user = items[i];

                if (user._id === action.payload._id) {
                    user.favouriteMovies = action.payload.favouriteMovies;
                    break;
                }
            }

            return {
                data: newUsersData,
                isLoading: false,
                error: null,
            };
        default:
            return state;
    }
};

export default usersReducer;
