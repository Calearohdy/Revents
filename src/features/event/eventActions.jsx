import { toastr } from 'react-redux-toastr'
import { FETCH_EVENT } from './eventConstants';
import {asyncActionStart, asyncActionFinish, asyncActionError} from '../async/asyncActions'
import { createNewEvent } from '../../app/common/util/helpers';
import moment from 'moment';
import firebase from '../../app/config/firebase';




export const createEvent = (event) => {
    return async (dispatch, getState, {getFirestore}) => {
        const firestore = getFirestore()
        const user = firestore.auth().currentUser;
        const photoURL = getState().firebase.profile.photoURL;
        let newEvent = createNewEvent(user, photoURL, event)
        try {
            let createdEvent = await firestore.add(`events`, newEvent);
            await firestore.set(`event_attendee/${createdEvent.id}_${user.uid}`,{
                eventId: createdEvent.id,
                userUid: user.uid,
                eventDate: event.date,
                host: true
            })
            toastr.success('Success', 'Event has been created')    
        } catch (error) {
            toastr.error('Oh No!', 'There was an Error')
         }
    }
}

export const updateEvent = (event) => {
    return async (dispatch, getState, {getFirestore}) => {
        const firestore = getFirestore();
        if(event.date !== getState().firestore.ordered.events[0].date) {
        event.date = moment(event.date).toDate();
        }
        try {
            await firestore.update(`events/${event.id}`, event)
            toastr.success('Success', 'Event has been updated')    
        } catch (error) {
            toastr.error('Oh No!', 'There was an Error')
         }
    }
}

export const cancelToggle = (cancelled, eventId) => async (dispatch, getState, {getFirestore}) => {
    const firestore = getFirestore();
    const message = cancelled ? 'Confirm cancelation?' : 'Confirm Reactivate?'
    try {
        toastr.confirm(message, {
            onOk: () => 
             firestore.update(`events/${eventId}`, {
                cancelled: cancelled
            })
        })
    } catch (error) {
        console.log(error)
    }
};


// rather than listening - we are just getting events data initially and using start After method to re-query the firebase document for more events after the last query
export const getEventsForDashboard = (lastEvent) => async (dispatch, getState) =>{
    //let today = new Date(Date.now())
    const firestore = firebase.firestore()
    const eventsRef = firestore.collection('events'); // creating the firestore query
    
    try {
      dispatch(asyncActionStart()) // calls the async reducer to set loading to true
      // getter method to grab the documents from the events collection
      let startAfter = lastEvent && await firestore.collection('events').doc(lastEvent.id).get()  // query to start after the last Event for pagination
      let query; // placeholder for new queries to firebase if a last event and start after event occur
      
      lastEvent ? query = eventsRef.orderBy('date').startAfter(startAfter).limit(2) // if there is a last event query firebase for paging .where('date', '>=', today)
      : query = eventsRef.orderBy('date').limit(2) // else keep initial query to firebase with two objects .where('date', '>=', today)
      let querySnap = await query.get() // executes the query to firebase
      //-- calls async reducer and returns an empty events state to the component if no events exist
      if (querySnap.docs.length === 0) {
          dispatch(asyncActionFinish())
          return querySnap; // this will have 0, 1 or 2 events
      }  
      // --
      let events = []; // init var to store documents data

      for (let i=0; i< querySnap.docChanges.length; i++) { // looping though the query data
        // data() method retrieves all fields in the document as objects
        let evt = {...querySnap.docs[i].data(), id: querySnap.docs[i].id}; // spreads all the fields into the evt var and also get all the ids and store into the evt var
        events.push(evt) // push objects into events array
      }
      dispatch({type: FETCH_EVENT, payload: {events}}) // passing data to the reducer so that it can be used in the state
      dispatch(asyncActionFinish()) // calls the async reducer to set loading to false
      return querySnap; // returns query data to the events state for the component to use
    
    } catch (error) {
        dispatch(asyncActionError()) // calls the async reducer to set loading to false
        console.log(error)
    }
}

// connecting event chat comment section to firebase
export const addEventComment = (eventId, values, parentId) =>
    async (dispatch, getState, {getFirebase}) => {
        const firebase = getFirebase();
        const profile = getState().firebase.profile
        const user = firebase.auth().currentUser
        let newComment = { // passing data up to firestore to better structure the data for more control
            parentId: parentId,
            displayName: profile.displayName,
            photoURL: profile.photoURL || '/assets/user.png',
            uid: user.uid,
            text: values.comment,
            date: Date.now() 
        }
        try {
            await firebase.push(`event_chat/${eventId}`, newComment)
        } catch (error) {
            console.log(error)
            toastr.error('Error', 'Unable to add your comment')
        }
    }