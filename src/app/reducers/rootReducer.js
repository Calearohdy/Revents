import { combineReducers } from 'redux';
import { reducer as FormReducer } from 'redux-form';
import testReducer from '../../features/test/testReducer';
import eventReducer from '../../features/event/eventReducer'
import modalsReducer from '../../features/modals/modalReducer'
import authReducer from '../../features/auth/authReducer'
import asyncReducer from '../../features/async/asyncReducer'
import { reducer as toastrReducer } from 'react-redux-toastr'
import { firebaseReducer } from 'react-redux-firebase';
import { firestoreReducer } from 'redux-firestore'

const rootReducer = combineReducers({
    firebase: firebaseReducer,
    firestore: firestoreReducer,
    form: FormReducer,
    test: testReducer,
    events: eventReducer,
    modals: modalsReducer,
    auth: authReducer,
    async: asyncReducer,
    toastr: toastrReducer
})

export default rootReducer;