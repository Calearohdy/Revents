import React from 'react';
import { compose } from 'redux'
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import { Grid, Segment, Header, Card } from 'semantic-ui-react';
import PersonCard from './PersonCard';


// recieving props from firestoreConnect and passing it to the query
// getting documents from your collection to display who you are following and whos following you
const query = ({ auth }) =>{
  return [
    {
      collection: 'users',
      doc: auth.uid,
      subcollections: [{ collection: 'following'}],
      storeAs: 'following'
    },    
    {
      collection: 'users',
      doc: auth.uid,
      subcollections: [{ collection: 'followers'}],
      storeAs: 'followers'
    }
  ]
}

const mapState = state => ({
  followings: state.firestore.ordered.following,
  followers: state.firestore.ordered.followers,
  auth: state.firebase.auth
})

const PeopleDashboard = ({ followings, followers }) => {
  return (
    <Grid>
      <Grid.Column width={16}>
        <Segment>
          <Header dividing content="People following me" />
          <Card.Group itemsPerRow={8} stackable>
          {followers && followers.map((follower) =>
            <PersonCard key={follower.id} user={follower}/>
            )}
          </Card.Group>
        </Segment>
        <Segment>
          <Header dividing content="People I'm following" />
          <Card.Group itemsPerRow={8} stackable>
          {followings && followings.map((following) =>
            <PersonCard key={following.id} user={following}/>
            )}
          </Card.Group>
        </Segment>
      </Grid.Column>
    </Grid>
  );
};
// passing in props (auth, follower, following) to the query and using the query at the top of the file
//export default compose(
              
export default compose(connect(mapState),firestoreConnect(props => query(props)))(PeopleDashboard)
                    
//                    , firestoreConnect(props => query(props)))(PeopleDashboard);