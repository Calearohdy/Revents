import React, {Component} from 'react';
import {Button, Card, Grid, Header, Icon, Image, Item, List, Menu, Segment} from "semantic-ui-react";
import { Link } from 'react-router-dom'
import { compose } from 'redux'
import { connect } from 'react-redux';
import { firestoreConnect, isEmpty } from 'react-redux-firebase';
import { differenceInYears, format } from 'date-fns';
import { userDetailedQuery } from '../userQueries';
import Lazyload from 'react-lazyload';
import LoadingComponent from '../../../app/layout/LoadingComponent'

// logic in state to check User profile
const mapState = (state, ownProps) => { // ownProps gives access to props from Parent component
    let userUid = null;
    let profile = {};

    if(ownProps.match.params.id === state.auth.id) { // checks to see if you are clicking on your user id or another attendee
        profile = state.firebase.profile
    } else {
        profile = !isEmpty(state.firestore.ordered.profile) && state.firestore.ordered.profile[0] // check profile isn't empty and isn't your profile
        userUid = ownProps.match.params.id
    }

    return {
        auth: state.firebase.auth,
        profile,
        userUid,
        photos: state.firestore.ordered.photos,
        requesting: state.firestore.status.requesting
    }

}
class UserDetailedPage extends Component {

    render() {
      const { profile, photos, auth, match, requesting } = this.props;
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

      const isCurrentUser = auth.uid === match.params.id;
      const loading = Object.values(requesting).some(a => a === true);

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
                <Grid.Column width={4}>
                    <Segment>
                        {isCurrentUser ? 
                    <Button as={Link} to='/settings' color='teal' fluid basic content='Edit Profile'/>
                    :
                    <Button color='green' fluid basic content='Follow User'/>    
                    }
                        
                    </Segment>
                </Grid.Column>

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
                <Grid.Column width={12}>
                    <Segment attached>
                        <Header icon='calendar' content='Events'/>
                        <Menu secondary pointing>
                            <Menu.Item name='All Events' active/>
                            <Menu.Item name='Past Events'/>
                            <Menu.Item name='Future Events'/>
                            <Menu.Item name='Events Hosted'/>
                        </Menu>
                
                        <Card.Group itemsPerRow={5}>

                            <Card>
                                <Image src={'/assets/categoryImages/drinks.jpg'}/>
                                <Card.Content>
                                    <Card.Header textAlign='center'>
                                        Event Title
                                    </Card.Header>
                                    <Card.Meta textAlign='center'>
                                        28th March 2018 at 10:00 PM
                                    </Card.Meta>
                                </Card.Content>
                            </Card>

                            <Card>
                                <Image src={'/assets/categoryImages/drinks.jpg'}/>
                                <Card.Content>
                                    <Card.Header textAlign='center'>
                                        Event Title
                                    </Card.Header>
                                    <Card.Meta textAlign='center'>
                                        28th March 2018 at 10:00 PM
                                    </Card.Meta>
                                </Card.Content>
                            </Card>

                        </Card.Group>
                    </Segment>
                </Grid.Column>
            </Grid>

        );
    }
}

export default compose(connect(mapState, null), firestoreConnect((auth, userUid)=> userDetailedQuery(auth, userUid)),)(UserDetailedPage);