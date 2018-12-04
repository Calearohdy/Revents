import { DECREMENT_COUNTER, INCREMENT_COUNTER, COUNTER_ACTION_FINISHED, COUNTER_ACTION_STARTED, ADD_USER } from "./testConstants";
import { createReducer } from '../../app/common/util/reducerUntil';

const initialState = []

export const incrementCounter = (state, payload) => {
    return {...state, data: state.data + 1}
}

export const decrementCounter = (state, payload) => {
    return {...state, data: state.data - 1}
}

export const counterActionStarted = (state, payload) => {
    return { ...state, loading: true}
};

export const counterActionFinished = (state, payload) => {
    return { ...state, loading: false}
};

export const addUser = (state, payload) => {
  return [...state, Object.assign({}, payload.user)]
}


export default createReducer(initialState, {
    [INCREMENT_COUNTER]: incrementCounter,
    [DECREMENT_COUNTER]: decrementCounter,
    [COUNTER_ACTION_FINISHED]: counterActionFinished,
    [COUNTER_ACTION_STARTED]: counterActionStarted,
    [ADD_USER]: addUser
});