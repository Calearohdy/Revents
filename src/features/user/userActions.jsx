import moment from 'moment'
import {toastr} from 'react-redux-toastr'


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
