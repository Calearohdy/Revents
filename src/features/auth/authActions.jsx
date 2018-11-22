import { SubmissionError, reset } from 'redux-form';
import { closeModal } from '../modals/modalActions';
import { toastr } from 'react-redux-toastr';

export const login = (creds) => {
    return async (dispatch, getState, {getFirebase}) => {
        const firebase = getFirebase();
        try {
            let existingUser = await firebase.auth().signInWithEmailAndPassword(creds.email, creds.password)
            console.log(existingUser)
            dispatch(closeModal())
        } catch (error) {
            // console.log(error)
            throw new SubmissionError({
                _error: 'Email or Password is incorrect. Please try again or Register!'
            })
        }
    }
}

export const registerUser = (user) => 
    async (dispatch, getState, {getFirebase, getFirestore}) => {
        const firebase = getFirebase()
        const firestore = getFirestore()

        try {
            //create the user in firebase auth
            let createdUser = await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);
            console.log(createdUser);
            //update the auth profile
            await createdUser.updateProfile({  // this update is being used with the user object that we returned that we created with an email and password
                displayName: user.displayName
            })
            //create new profile in firestore
            let newUser = {
                displayName: user.displayName,
                createdAt: firestore.FieldValue.serverTimestamp()
            }
            await firestore.set(`users/${createdUser.uid}`, {...newUser});
            dispatch(closeModal());
        } catch (error) {
            console.log(error)
            throw new SubmissionError({
                _error: error.message
            })
        }
    }

export const socialLogin = (selectedProvider) => 
    async (dispatch, getState, {getFirebase, getFirestore}) => {
        const firebase = getFirebase();
        const firestore = getFirestore();
        try {
            dispatch(closeModal())
            let user = await firebase.login({
                provider: selectedProvider, // provide action with name of provider
                type: 'popup'
            })
            console.log(user)
            if (user.additionalUserInfo.isNewUser) {
                await firestore.set(`users/${user.user.uid}`, {
                    displayName: user.profile.displayName,
                    photoURL: user.profile.avatarUrl,
                    createdAt: firestore.FieldValue.serverTimestamp()
                })
            }
        } catch(error) {
            console.log(error)
        }
    }

export const updatePassword = (creds) => 
    async (dispatch, getState, {getFirebase}) => {
        const firebase = getFirebase();
        const user = firebase.auth().currentUser;

        try {
            await user.updatePassword(creds.newPassword1);
            await dispatch(reset('account'));
            toastr.success('Success', 'Your Password has been updated')
        } catch(error) {
            throw new SubmissionError({
                _error: error.message
            })
        }
    }
    