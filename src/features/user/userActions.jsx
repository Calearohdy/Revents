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
    
    export const setMainPhoto = (photo) => async (dispatch, getState)=>{
        dispatch(asyncActionStart())
        const firestore = firebase.firestore()
        const user = firebase.auth().currentUser;
        const today = new Date(Date.now());
        let userDocRef = firestore.collection('users').doc(user.uid); // reference to the users documents
        let eventAttendeeRef = firestore.collection('event_attendee') // reference to the attendees for each event

        try {
            let batch = firestore.batch() // performing multiple writes in one action
            // updating user profile photo in firebase
            await batch.update(userDocRef, {
                photoURL: photo.url
            })
            // creating a query to get the initial data that we will be performing an action on based on the where condition
            let eventQuery = await eventAttendeeRef.where('userUid', '==', user.uid).where('eventDate', '>', today)
            // getting and storing the data/documents that we just received from the query above, providing a snapshot to work with
            // allowing us to loop through them and update them
            let eventQuerySnap = await eventQuery.get()
            for(let i=0; i<eventQuerySnap.docs.length; i++) {
                let eventDocRef = await firestore.collection('events').doc(eventQuerySnap.docs[i].data().eventId);
                let event = await eventDocRef.get()
                if(event.data().hostUid === user.uid) {
                    batch.update(eventDocRef, {
                        hostPhotoURL: photo.url,
                        [`attendees.${user.uid}.photoURL`]: photo.url
                    })
                } else {
                    batch.update(eventDocRef, {
                        [`attendees.${user.uid}.photoURL`]: photo.url
                    })
                }
            }
          console.log(batch)
          await batch.commit()
          dispatch(asyncActionFinish())  
        } catch (error) {
            dispatch(asyncActionError())
            console.log(error)
            throw new Error(error)
        }
    }

    /*
        Once follow user is clicked on, followUser action will
        connect to firebase api, add a new following collection user with the followed user data
    */
    export const followUser = (userToFollow) => async (dispatch, getState, {getFirestore})=> {
        const firestore = getFirestore()
        const user = firestore.auth().currentUser // this is grabbing the authenticated user - this is who is logged in
        const followed = {
            photoURL: userToFollow.photoURL || '/assets/user.png',
            city: userToFollow.city || 'Unknown City',
            displayName: userToFollow.displayName
        };
        //const followed = getState().firestore.ordered.following  // grabs user objects in the array of users you are following
        dispatch(asyncActionStart()) // call reducer for state boolean 

        try {
            
            // creates current user subcollection following
            await firestore.set(
                {
                collection: 'users',
                doc: user.uid,
                subcollections: [{collection: 'following', doc: userToFollow.id}]
                }, 
                followed
            );

            dispatch(asyncActionFinish())
            toastr.success('Success','Better check firebase!')
        } catch (error) {
            console.log(error)
            dispatch(asyncActionError())
            toastr.error('Error', 'Yikes...')
        }
    }

    export const unfollowUser = (unfollow) => async (dispatch, getState, {getFirestore}) => {
        const firestore = getFirestore()
        const user = firestore.auth().currentUser
    
        dispatch(asyncActionStart()) // call reducer for state boolean
        
        try {

            await firestore.delete({
                collection: 'users',
                doc: user.uid,
                subcollections: [{collection: 'following', doc: unfollow.id}]
            })

            dispatch(asyncActionFinish())
            toastr.success('Success', `You unfollowed ${unfollow.displayName}`)

        } catch (error) {
            dispatch(asyncActionError())
            console.log(error)
            toastr.error('Error', `${unfollow.displayName} says no`)
        }
    }
    
    export const goingToEvent = (event) => async (dispatch, getState)=>{
        dispatch(asyncActionStart())
        const firestore = firebase.firestore()
        const user = firebase.auth().currentUser;
        const profile = getState().firebase.profile;
        const attendee = { // setting up meta data to refer to
            going: true,
            joinDate: Date.now(),
            photoURL: profile.photoURL || '/assets/user.png',
            displayName: profile.displayName,
            host: false
        }

        try {
            let eventDocRef = firestore.collection('events').doc(event.id)
            let eventAttendeeDocRef = firestore.collection('event_attendee').doc(`${event.id}_${user.uid}`)

            await firestore.runTransaction(async (transaction) => {
                await transaction.get(eventDocRef);
                await transaction.update(eventDocRef, {
                    [`attendees.${user.uid}`]: attendee
                })
                await transaction.set(eventAttendeeDocRef, {
                    eventId: event.id,
                    userUid: user.uid,
                    eventDate: event.date,
                    host: false
                })
            })
            await firestore.update(`events/${event.id}`, {
                [`attendees.${user.uid}`]: attendee
            })
            await firestore.set(`event_attendee/${event.id}_${user.uid}`, { // lookup data
                eventId: event.id,
                userUid: user.uid,
                eventDate: event.date,
                host: false
            })
            dispatch(asyncActionFinish())
            toastr.success('Success', 'You have signed up for the event')
        } catch (error) {
            console.log(error);
            dispatch(asyncActionError())
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