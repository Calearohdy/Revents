import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { reactReduxFirebase, getFirebase } from 'react-redux-firebase';
import { reduxFirestore, getFirestore } from 'redux-firestore';
import firebase from '../../app/config/firebase';
import thunk from 'redux-thunk';
import rootReducer from '../reducers/rootReducer';

const rrfConfig = { // firebase setup
    userProfile: 'users',
    attachAuthIsReady: true,
    useFirestoreForProfile: true
}

export const configureStore = (preloadedState) => {
    const middlewares = [thunk.withExtraArgument({getFirebase, getFirestore})];
    const middlewaresEnhancer = applyMiddleware(...middlewares);
    const storeEnhancer = [middlewaresEnhancer];
    const composedEnhancer = composeWithDevTools(...storeEnhancer, reactReduxFirebase(firebase, rrfConfig), reduxFirestore(firebase));

    const store = createStore(
        rootReducer,
        preloadedState,
        composedEnhancer
    );

    if(process.env.NODE_ENV !== 'production') {
        if (module.hot) {
            module.hot.accept('../reducers/rootReducer', () => {
                const newRootReducer = require('../reducers/rootReducer').default;
                store.replaceReducer(newRootReducer)
            })
        }
    }

    return store;
}