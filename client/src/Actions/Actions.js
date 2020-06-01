import {
    ADD_RECORD_FAILURE,
    ADD_RECORD_START,
    ADD_RECORD_SUCCESS,
    AUTHENTICATION_CLEAR,
    AUTHENTICATION_FAILURE,
    AUTHENTICATION_START,
    AUTHENTICATION_SUCCESS,
    GET_RECORDS_FAILURE,
    GET_RECORDS_START,
    GET_RECORDS_SUCCESS,
    POPULATE_MOVIES_AUTOSUGGEST_FAILURE,
    POPULATE_MOVIES_AUTOSUGGEST_START,
    POPULATE_MOVIES_AUTOSUGGEST_SUCCESS,
    POPULATE_TV_AUTOSUGGEST_FAILURE,
    POPULATE_TV_AUTOSUGGEST_START,
    POPULATE_TV_AUTOSUGGEST_SUCCESS,
} from "./ActionTypes";
import {
    getMovieCreditsById,
    getMovieDetailsById,
    getTvSeriesDetailsById,
    searchMoviesByTitle,
    searchTvSeriesByTitle
} from "../Services/TMDBServices";
import {createRecord as tryCreateRecord, getRecords as tryGetRecords, login as tryLogin, register as tryRegister} from "../Services/MongoDBServices";
import {TRACKED_USER_DATA} from "../Consts";
import {Record} from "../Models/Record";

/**
 * Thunk функция для выполнения ajax запроса для поиска фильмов.
 *
 * @param {string} searchInput Значение, по которому будет осуществляться поиск.
 */
export function searchMovies(searchInput) {
    return function (dispatch) {
        dispatch({type: POPULATE_MOVIES_AUTOSUGGEST_START});

        return searchMoviesByTitle(searchInput).then(
            (result) => dispatch({type: POPULATE_MOVIES_AUTOSUGGEST_SUCCESS, payload: result}),
            (error) => dispatch({type: POPULATE_MOVIES_AUTOSUGGEST_FAILURE, payload: error}),
        );
    };
}

/**
 * Thunk функция для выполнения ajax запроса для поиска сериалов.
 *
 * @param {string} searchInput Значение, по которому будет осуществляться поиск.
 */
export function searchTvSeries(searchInput) {
    return function (dispatch) {
        dispatch({type: POPULATE_TV_AUTOSUGGEST_START});

        return searchTvSeriesByTitle(searchInput).then(
            (result) => dispatch({type: POPULATE_TV_AUTOSUGGEST_SUCCESS, payload: result}),
            (error) => dispatch({type: POPULATE_TV_AUTOSUGGEST_FAILURE, payload: error}),
        );
    };
}

/**
 * Thunk функция для выполнения ajax запроса для получения полной информации о фильме.
 *
 * @param {number} id TMDb идентификатор фильма.
 * @param {ObjectId} userId Идентификатор пользователя.
 */
export function addDetailedMovieRecord(id, userId) {
    return async function (dispatch) {
        dispatch({type: ADD_RECORD_START});

        try {
            const results = await Promise.all([getMovieDetailsById(id), getMovieCreditsById(id)]);
            const newRecord = new Record({userId, type: "movie", data: {details: results[0].data, credits: results[1].data}});
            await tryCreateRecord(newRecord);
            dispatch({type: ADD_RECORD_SUCCESS, payload: newRecord});
            return results;
        } catch (error) {
            dispatch({type: ADD_RECORD_FAILURE, payload: error});
            throw error;
        }
    };
}

/**
 * Thunk функция для выполнения ajax запроса для получения полной информации о сериале.
 *
 * @param {number} id TMDb идентификатор сериала.
 * @param {ObjectId} userId Идентификатор пользователя.
 */
export function addDetailedTvSeriesRecord(id, userId) {
    return async function (dispatch) {
        dispatch({type: ADD_RECORD_START});

        try {
            const results = await getTvSeriesDetailsById(id);
            const newRecord = new Record({userId, type: "tvseries", data: {details: results.data}});
            await tryCreateRecord(newRecord);
            dispatch({type: ADD_RECORD_SUCCESS, payload: newRecord});
            return results;
        } catch (error) {
            dispatch({type: ADD_RECORD_FAILURE, payload: error});
            throw error;
        }
    };
}

/**
 * Thunk функция для выполнения ajax запроса для получения полной информации о сериале.
 *
 * @param {ObjectId} userId Идентификатор пользователя.
 */
export function getRecords(userId) {
    return async function (dispatch) {
        dispatch({type: GET_RECORDS_START});

        try {
            const records = await tryGetRecords(userId);
            dispatch({type: GET_RECORDS_SUCCESS, payload: records});
            return records;
        } catch (error) {
            dispatch({type: GET_RECORDS_FAILURE, payload: error});
            throw error;
        }
    };
}

/**
 * Thunk функция для выполнения ajax запроса для логина пользователя.
 */
export function login({email, password}) {
    return async function (dispatch) {
        dispatch({type: AUTHENTICATION_START});

        try {
            const response = await tryLogin({email, password});
            dispatch({type: AUTHENTICATION_SUCCESS, payload: response});
            /**
             * Складываем данные пользователя в локал сторедж.
             */
            localStorage.setItem(TRACKED_USER_DATA, JSON.stringify({userId: response.data.userId, token: response.data.token}));

            return response;
        } catch (error) {
            dispatch({type: AUTHENTICATION_FAILURE, payload: error});
            throw error;
        }
    };
}

/**
 * Экшен криэйтор для выполнения действия логаут пользователя.
 */
export function logout() {
    /**
     * Удаляем данные пользователя из локал сторедж.
     */
    localStorage.removeItem(TRACKED_USER_DATA);

    return {
        type: AUTHENTICATION_CLEAR
    };
}

/**
 * Thunk функция для выполнения ajax запроса для регистрации пользователя.
 */
export function register({email, password}) {
    return async function (dispatch) {
        dispatch({type: AUTHENTICATION_START});

        try {
            const response = await tryRegister({email, password});
            dispatch({type: AUTHENTICATION_SUCCESS, payload: response});
            return response;
        } catch (error) {
            dispatch({type: AUTHENTICATION_FAILURE, payload: error});
            throw error;
        }
    };
}