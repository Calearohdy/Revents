import moment from 'moment'
import {toastr} from 'react-redux-toastr'
import cuid from 'cuid';
import { asyncActionFinish, asyncActionStart, asyncActionError } from '../async/asyncActions';


export const updateProfile = (user) => 
    async (dispatch, getState, {getFirebase}) => {
        const firebase = getFirebase();
        const {isLoaded, isEmpty, ...updatedUser} = user; // omitting isLoaded and isEmpty by using the spread-operator
        if (updatedUser.dateOfBirth !== getState().firebase.profile.dateOfBirth) {
            updatedUser.dateOfBirth = moment(updatedUser.dateOfBirth).toDate();
        }

        try {
            await firebase.updateProfile(updatedUser); // this is using the firebase user profile and assigning it there, it takes the user object and updates the firestore
            toastr.success('Success', 'Profile Updated')
        } catch (error) {
            console.log(error)
        }
    }
 export const uploadProfileImage = (file, fileName) => 
    async (dispatch, getState, {getFirebase, getFirestore}) => {
        const firebase = getFirebase();
        const firestore = getFirestore();
        const imageName = cuid();
        const user = firebase.auth().currentUser;
        const path = `${user.uid}/user_images`;
        const options = {
            name: imageName
        }

        try {
            dispatch(asyncActionStart())
            // upload file to firebase storage
            let uploadedFile = await firebase.uploadFile(path, file, null, options);
            // get url of image
            let downloadURL = await uploadedFile.uploadTaskSnapshot.downloadURL;
            // get userdoc from firestore then check if there's a photo
            let userDoc = await firestore.get(`users/${user.uid}`);
            // if not we will set the uploaded file as main photo
            if (!userDoc.data().photoURL) {
                await firebase.updateProfile({
                    photoURL: downloadURL
                });
                await user.updateProfile({
                    photoURL: downloadURL
                })
            }
            // add new photo to photos collection
             await firestore.add({
                collection: 'users',
                doc: user.uid,
                subcollections: [{collection: 'photos'}]
            },{
                name: imageName,
                url: downloadURL
            })
            dispatch(asyncActionFinish())
        } catch (error) {
            console.log(error);
            dispatch(asyncActionError())
            throw new Error('Problem uploading photo');
        }
    }

    export const deletePhoto = (photo) => async (dispatch, getState, {getFirebase, getFirestore}) => {
        const firebase = getFirebase();
        const firestore = getFirestore();
        const user = firebase.auth().currentUser;

        try {
            await firebase.deleteFile(`${user.uid}/user_images/${photo.name}`)
            await firestore.delete({
                collection: 'users',
                doc: user.uid,
                subcollections: [{collection: 'photos', doc: photo.id}]
            })
        } catch (error) {
            console.log(error);
            throw new Error('Problem deleting the photo')
        }
    }
    
    export const setMainPhoto = (photo) => async (dispatch, getState, {getFirebase})=>{
        const firebase = getFirebase();
        try {
            return await firebase.updateProfile({
                photoURL: photo.url
            });
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }
    