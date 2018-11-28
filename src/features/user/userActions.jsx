import moment from 'moment'
import {toastr} from 'react-redux-toastr'
import cuid from 'cuid';
import { asyncActionFinish, asyncActionStart, asyncActionError } from '../async/asyncActions';
import firebase from '../../app/config/firebase';
import { FETCH_EVENT } from '../event/eventConstants';


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

    /*
        Once follow user is clicked on, followUser action will
        connect to firebase api, add a new following collection user with the followed user data
    */

    export const followUser = (profile) => async (dispatch, getState, {getFirestore})=> {
        const firestore = getFirestore()
        const currentUser = firestore.auth().currentUser // this is grabbing the authenticated user - this is who is logged in
        const newFollow = profile // this is the profile you are on
        //const followed = getState().firestore.ordered.following  // grabs user objects in the array of users you are following
        dispatch(asyncActionStart()) // call reducer for state boolean 

        try {
            
            // creates current user subcollection following
            await firestore.add({
                collection: 'users',
                doc: currentUser.uid,
                subcollections: [{collection: 'following'}]
            }, {
                follow: true,
                photoURL: newFollow.photoURL || '/assets/user.png',
                displayName: newFollow.displayName
            })

            // create selected user subcollection followed
            await firestore.add(
                {
                collection: 'users',
                doc: newFollow.id,
                subcollections: [{collection: 'followed'}]    
                },
                {
                  follow: true,
                  followedId: currentUser.uid,  
                  photoURL: currentUser.photoURL || '/assets/user.png',
                  displayName: currentUser.displayName  
                }
            )

            // creating relationship table of follower/followed    
            await firestore.set(`followed_Following/${currentUser.uid}_${newFollow.id}`, {
                followerId: currentUser.uid,
                followedId: newFollow.id,
                following: true,
                follower: currentUser.displayName,
                followed: newFollow.displayName
            })

            dispatch(asyncActionFinish())
            toastr.success('Success','Better check firebase!')
        } catch (error) {
            console.log(currentUser)
            console.log(newFollow)
            console.log(error)
            dispatch(asyncActionError())
            toastr.error('Error', 'Yikes...')
        }
    }
    
    export const goingToEvent = (event) => async (dispatch, getState, {getFirestore})=>{
        const firestore = getFirestore()
        const user = firestore.auth().currentUser;
        const photoURL = getState().firebase.profile.photoURL;
        const attendee = { // setting up meta data to refer to
            going: true,
            joinDate: Date.now(),
            photoURL: photoURL || '/assets/user.png',
            displayName: user.displayName,
            host: false
        }

        try {
            await firestore.update(`events/${event.id}`, {
                [`attendees.${user.uid}`]: attendee
            })
            await firestore.set(`event_attendee/${event.id}_${user.uid}`, { // lookup data
                eventId: event.id,
                userUid: user.uid,
                eventDate: event.date,
                host: false
            })

            toastr.success('Success', 'You have signed up for the event')
        } catch (error) {
            console.log(error);
            toastr.error('Error', 'An Error as occured')
        }
    }

    export const cancelGoingToEvent = (event) => async (dispatch, getState, {getFirestore}) => {
        const firestore = getFirestore();
        const user = firestore.auth().currentUser

        try {
            await firestore.update(`events/${event.id}`, {
                [`attendees.${user.uid}`]: firestore.FieldValue.delete()
            })
            await firestore.delete(`event_attendee/${event.id}_${user.uid}`);
            toastr.success('Success','Removed from event')
        } catch (error) {
            console.log(error)
            toastr.error('Error', 'Something went wrong')
        }
    }

    export const getUserEvents = (userUid, activeTab) =>
        async (dispatch, getState) => {
            dispatch(asyncActionStart()) //  call async reducer to set loading to true
            const firestore = firebase.firestore();
            const today = new Date(Date.now())
            console.log(today)
            let eventsRef = firestore.collection('event_attendee'); // query on event_attendee to pull out the events the user is going too
            let query;
            switch(activeTab) { // active tab is passed in as a number 1-4
                default: // hosted events tab
                    query = eventsRef.where('userUid', '==', userUid).where('host', '==', true).orderBy('eventDate', 'desc');
                //     break;
                // case 2: // future events
                //     query = eventsRef.where('userUid', '==', userUid).where('eventDate', '>=', today).orderBy('eventDate');
                //     break;
                // case 3: // past events
                //     query = eventsRef.where('userUid', '==', userUid).where('eventDate', '<=', today).orderBy('eventDate', 'desc');
                //     break;
                // default: // all events
                //     query = eventsRef.where('userUid', '==', userUid).orderBy('eventDate', 'desc');      
            }
            try {
                let querySnap = await query.get() // query snapshot provied from firestore -- instance of the query that is ready to be used
               
                if (querySnap.docs.length === 0) {
                    dispatch(asyncActionFinish())
                    toastr.error('Error', 'No events available currently')
                    console.log(querySnap);
                    return querySnap;
                }

                let events = [];

                for (let i = 0; i < querySnap.docs.length; i++) {
                    // loop though events in the events collection in firestore where each query snapshot object is
                    // is retrieved and stored into the evt variable
                    let evt = await firestore.collection('events').doc(querySnap.docs[i].data().eventId).get()
                    events.push({...evt.data(), id: evt.id}) // spread evt objects using data method and push into events array along with the evt id
                    
                }
                dispatch({type: FETCH_EVENT, payload: {events}}) // pass events data into the events reducer
                dispatch(asyncActionFinish())
                console.log(querySnap);
                return querySnap;
            } catch (error) {
                console.log(error)
                dispatch(asyncActionError())
            }
        }