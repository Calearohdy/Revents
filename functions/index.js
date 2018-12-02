const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const newActivity = (type, event, id) => {
    return {
        type: type,
        eventdate: event.date,
        hostedBy: event.hostedBy,
        title: event.title,
        photoURL: event.hostPhotoURL,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        hostUid: event.hostUid,
        eventId: id
    }
}
// users collection/current user id/ following/ user you are following id
exports.userFollowing = functions.firestore.document('users/{followerUid}/following/{followingUid}').onCreate((event, context) => { // event and context are passed to get the params
        console.log('first step')
        const followerUid = context.params.followerUid;
        const followingUid = context.params.followingUid;

        // this is a reference to the current doc -- current user
        // create a document to get data from then structure it
        const followerDoc = admin
        .firestore() // this allows access to the database
        .collection('users')
        .doc(followerUid)

        console.log(followerDoc)
        // this is a reference to the followed user doc --followed user
        // followerDoc contains information that was created 
        return followerDoc.get().then(doc => {
            let userData = doc.data() // storing information
            console.log({userData})
            let follower = { // storing the current users information into a followed collection for the user being followed
                displayName: userData.displayName,
                photoURL: userData.photoURL || '/assets/user.png',
                city: userData.city || 'Unknown city'
            };
            return admin
            .firestore()
            .collection('users') // users collection
            .doc(followingUid) // the user you are following
            .collection('followers') // creating a new subcollection of following
            .doc(followerUid) // this wil set the document id being created to your id
            .set(follower) // stores your information into that document
        })

    });
// this cloud function is activated when you unfollow a user
// it first needs to grab the document that needs to be deleted via document method,
// then pass the event and context to the onDelete
// context.params will grab the id from the parameters and then delete
// use a promise to either get a success or error
exports.unfollowUser = functions.firestore.document('users/{followerUid}/following/{followingUid}').onDelete((event, context) => {
    return admin.firestore().collection('users').doc(context.params.followingUid).collection('followers').doc(context.params.followerUid)
        .delete()
        .then(()=> {
            return console.log('doc deleted')
        })
        .catch(err => {
            return console.log(err)
        });
});    

exports.createActivity = functions.firestore
    .document('events/{eventId}')
    .onCreate(event => {
        let newEvent = event.data();

        console.log(newEvent);

        const activity = newActivity('newEvent', newEvent, event.id);

        console.log(activity)

        return admin.firestore().collection('activity')
            .add(activity)
            .then((docRef) => {
                return console.log('Activity created with ID: ', docRef.id)
            })
            .catch((err) => {
                return console.log('Error Added', err)
            })
    })

exports.cancelActivity = functions.firestore.document('events/{eventId}').onUpdate((event, context) => {
    let updatedEvent = event.after.data();
    let previousEventData = event.before.data();

    console.log({event})
    console.log({context})
    console.log({updatedEvent})
    console.log({previousEventData})

    if (!updatedEvent.cancelled || updatedEvent.cancelled === previousEventData.cancelled) return false;

    const activity = newActivity('cancelledEvent', updatedEvent, context.params.eventId);
   
    console.log({activity});

    return admin.firestore().collection('activity').add(activity)
            .then(docRef => {
                return console.log('Activity created with ID: ', docRef.id)
            })
            .catch(err => {
                return console.log('Error Added', err)
            })
})