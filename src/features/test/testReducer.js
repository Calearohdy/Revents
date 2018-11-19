import { DECREMENT_COUNTER, INCREMENT_COUNTER } from "./testConstants";
import { createReducer } from '../../app/common/util/reducerUntil';

const initialState = {
    data: 47
}

export const incrementCounter = (state, payload) => {
    return {...state, data: state.data + 1}
}

export const decrementCounter = (state, payload) => {
    return {...state, data: state.data - 1}
}

export default createReducer(initialState, {
    [INCREMENT_COUNTER]: incrementCounter,
    [DECREMENT_COUNTER]: decrementCounter
});