import React, {Component} from 'react';
import { Grid, Header, Icon, Image, Item, List, Segment} from "semantic-ui-react";
import { compose } from 'redux'
import { connect } from 'react-redux';
import {toastr} from 'react-redux-toastr';
import { firestoreConnect, isEmpty } from 'react-redux-firebase';
import { differenceInYears, format } from 'date-fns';
import { userDetailedQuery } from '../userQueries';
import Lazyload from 'react-lazyload';
import LoadingComponent from '../../../app/layout/LoadingComponent'
import UserDetailedEvents from './UserDetailedEvents'
import { getUserEvents, followUser, unfollowUser } from '../userActions';
import UserDetailedButton from './UserDetailedButton';

// logic in state to check User profile
const mapState = (state, ownProps) => { // ownProps gives access to props from Parent component
    let userUid = null;
    let profile = {};

    // this is user profile
    if(ownProps.match.params.id === state.auth.id) { // checks to see if you are clicking on your user id or another attendee
        profile = state.firebase.profile
    // this is not your profile    
    } else {
        profile = !isEmpty(state.firestore.ordered.profile) && state.firestore.ordered.profile[0] // check profile isn't empty and isn't your profile
        userUid = ownProps.match.params.id
    }

    // these all exist in the reducer and are being mapped to the state as props
    return {
        auth: state.firebase.auth,
        profile,
        userUid,
        events: state.events,
        eventsLoading: state.async.loading,
        photos: state.firestore.ordered.photos,
        following: state.firestore.data.following,
        requesting: state.firestore.status.requesting  // handles loading screens with hooks provided by firestore
    }

}

const actions = {
    getUserEvents,
    followUser,
    unfollowUser
}
class UserDetailedPage extends Component {

    async componentDidMount() { // used to actually call method from user action
        let user = await this.props.firestore.get(`users/${this.props.match.params.id}`)
        if (!user.exists) {
            toastr.error('Error', 'User was not found')
            this.props.history.push('/error')
        }
        //let events = await this.props.getUserEvents(this.props.userUid); // handles events query to firebase with 2 params, user id and tab
        // let following = await this.props.following;
        // let profile = await this.props.profile;
        // console.log(profile);
        // console.log(following, 'following');
    }

    changeTab = (event, data) => {
        let changeTab = this.props.getUserEvents(this.props.userUid, data.activeIndex)
        console.log(changeTab)
    }

    // takes followed params [array of objects] compares it against current user id
    // if there is a value that 
    // isFollowingUser = (followed, match) => {
    //     let userId = match.params.id;
    //     let isFollowing;
    //     loop: {
    //         for(var i=0; i<followed.length; i++) {
    //             if((followed[i].followedId === userId)) {
    //                 isFollowing = true;
    //                 break loop;
    //             }
    //         }
    //         isFollowing = false;
    //     }
    //     return isFollowing
    // }


    render() {
      const { profile, photos, auth, match, requesting, events, eventsLoading, followUser, following, unfollowUser } = this.props;
      let age;
      if (profile.dateOfBirth) {
        age = differenceInYears(Date.now(), profile.dateOfBirth.toDate())
      } else {
        age = 'Unknown age'
      }
      let created;
      if (profile.createdAt) {
        created = format(profile.createdAt.toDate(), 'D MMM YYYY')
      } else {
        created = 'Error'
      }
      // matches followed key with current user key id
      // pull key out of array of followed objects
    //  let isFollowed = false;
    //   if (followed) {
    //     isFollowed = this.isFollowingUser(followed, match)
    //   }
      const isCurrentUser = auth.uid === match.params.id;
      const loading = requesting[`users/${match.params.id}`]
      const isFollowing = !isEmpty(following)

      if (loading) return <LoadingComponent />
        return (
            <Grid>
                <Grid.Column width={16}>
                    <Segment>
                        <Item.Group>
                            <Item>
                                <Item.Image avatar size='small' src={profile.photoURL || '/assets/user.png'}/>
                                <Item.Content verticalAlign='bottom'>
                                    <Header as='h1'>{profile.displayName}</Header>
                                    <br/>
                                    <Header as='h3'>{profile.occupation || 'Occupation'}</Header>
                                    <br/>
                                    <Header as='h3'>{age}, Lives in {profile.city || 'City'}</Header>
                                </Item.Content>
                            </Item>
                        </Item.Group>

                    </Segment>
                </Grid.Column>
                <Grid.Column width={12}>
                    <Segment>
                        <Grid columns={2}>
                            <Grid.Column width={10}>
                                <Header icon='smile' content='About Display Name'/>
                                <p>I am a: <strong>{profile.occupation || 'Update Occupation'}</strong></p>
                                <p>Originally from <strong>{profile.origin || 'Update Origin'}</strong></p>
                                <p>Member Since: <strong>{created}</strong></p>
                                <p>{profile.about || 'Update About me'}</p>

                            </Grid.Column>
                            <Grid.Column width={6}>

                                <Header icon='heart outline' content='Interests'/>
                                
                                  {profile.interests ? 
                                  <List>
                                    {profile.interests && 
                                      profile.interests.map((interest, index)=>(
                                    <Item key={index}>
                                      <Icon name='heart'/>
                                      <Item.Content >{interest}</Item.Content>
                                    </Item>
                                    ))} 
                                    </List> : <p>No interests set</p>}
                            </Grid.Column>
                        </Grid>

                    </Segment>
                </Grid.Column>
                <UserDetailedButton
                    eventsLoading={eventsLoading} 
                    isFollowing={isFollowing}
                    profile={profile}
                    followUser={followUser}
                    isCurrentUser={isCurrentUser}
                    unfollowUser={unfollowUser}                        
                />

                <Grid.Column width={12}>
                    <Segment attached>
                        <Header icon='image' content='Photos'/>
                        
                        <Image.Group size='small'>
                        {photos ? photos.map((photo)=>(
                          <Lazyload key={photo.id} height={150} placeholder={<Image src="/assets/user.png"/>}>
                            <Image src={photo.url}/>
                          </Lazyload>
                        )) : <Image src={profile.photoURL}/>}
                        </Image.Group>
                    </Segment>
                </Grid.Column>
                {/* this remains static for now*/}
                <UserDetailedEvents events={events} eventsLoading={eventsLoading} changeTab={this.changeTab}/>
            </Grid>

        );
    }
}

export default compose(connect(mapState, actions), firestoreConnect((auth, userUid, match)=> userDetailedQuery(auth, userUid, match)),)(UserDetailedPage);