import firebase from 'firebase';
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyC1DlYpihRFCP8FTYvwaffo1aOYZXEmIFQ",
    authDomain: "revents-223116.firebaseapp.com",
    databaseURL: "https://revents-223116.firebaseio.com",
    projectId: "revents-223116",
    storageBucket: "revents-223116.appspot.com",
    messagingSenderId: "74084293308"
}

firebase.initializeApp(firebaseConfig)
const firestore = firebase.firestore();
const settings = {
    timestampsInSnapshots: true
}

firestore.settings(settings);

export default firebase;