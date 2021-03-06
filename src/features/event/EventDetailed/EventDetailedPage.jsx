import React, { Component } from 'react'
import EventDetailedHeader from './EventDetailedHeader';
import { withFirestore, firebaseConnect, isEmpty } from 'react-redux-firebase'
import { compose } from 'redux';
import {toastr} from 'react-redux-toastr';
import EventDetailedInfo from './EventDetailedInfo';
import EventDetailedChat from './EventDetailedChat'
import EventDetailedSidebar from './EventDetailedSidebar'
import { Grid } from 'semantic-ui-react'
import { connect } from 'react-redux';
import { objectToArray, createDataTree } from '../../../app/common/util/helpers'
import { goingToEvent, cancelGoingToEvent } from '../../user/userActions';
import { addEventComment } from '../eventActions';
import { openModal } from '../../modals/modalActions';
import LoadingComponent from '../../../app/layout/LoadingComponent';

const actions = {
  goingToEvent,
  cancelGoingToEvent,
  addEventComment,
  openModal
}

const mapState = (state, ownProps) => { // ownProps is props contained in the component and need to be passed as a param in mapState for use in the function

  let event = {};

  if (state.firestore.ordered.events && state.firestore.ordered.events[0]) {
    event = state.firestore.ordered.events[0]
  }

  return { // becomes props for the component to use from state - controlled by the reducer - given by higher order function Redux
    event,
    auth: state.firebase.auth,
    loading: state.async.loading,
    requesting: state.firestore.status.requesting,
    // normal check to see if a chat is available, then use objecttoArray to get the object Id and Values in an array
    eventChat: !isEmpty(state.firebase.data.event_chat) && objectToArray(state.firebase.data.event_chat[ownProps.match.params.id])
  }
}

class EventDetailedPage extends Component {

  state = {
    initialLoading: true
  }

  async componentDidMount() {
    const {firestore, match} = this.props;
    let event = await firestore.get(`events/${match.params.id}`)
    if (!event.exists) {
      toastr.error('Not Found', 'Unable to find an event');
      this.props.history.push('/error');
    }
    await firestore.setListener(`events/${match.params.id}`);
    this.setState({
      initialLoading: false
    })
  }

  async componentWillUnmount() {
    const {firestore, match} = this.props;
    await firestore.unsetListener(`events/${match.params.id}`);

  }

  render() {
    const {event, auth, goingToEvent, cancelGoingToEvent, addEventComment, eventChat, loading, openModal, requesting, match} = this.props;
    const attendees = event && event.attendees && objectToArray(event.attendees).sort(function(a,b) {
      return a.joinDate - b.joinDate;
    });
    const isHost = event.hostUid === auth.uid;
    const isGoing = attendees && attendees.some(a => a.id === auth.uid); // callback method that checks an array for true results
    const chatTree = !isEmpty(eventChat) && createDataTree(eventChat);
    const authenticated = auth.isLoaded && !auth.isEmpty
    const loadingEvent = requesting[`events/${match.params.id}`]

    if (loadingEvent || this.state.initialLoading) return <LoadingComponent />
    return (
      <Grid>
      <Grid.Column width={10}>
        <EventDetailedHeader openModal={openModal} authenticated={authenticated} loading={loading} event={event} isHost={isHost} isGoing={isGoing} goingToEvent={goingToEvent} cancelGoingToEvent={cancelGoingToEvent}/>
        <EventDetailedInfo event={event}/>
        {authenticated &&
        <EventDetailedChat addEventComment={addEventComment} eventId={event.id} eventChat={chatTree} />
        }
      </Grid.Column>
      <Grid.Column width={6}>
        <EventDetailedSidebar attendees={attendees}/>
      </Grid.Column>
    </Grid>
    )
  }
}


export default compose(
                  withFirestore, 
                  connect(mapState, actions), 
                  firebaseConnect((props)=>props.auth.isLoaded && !props.auth.isEmpty && ([`event_chat/${props.match.params.id}`])))(EventDetailedPage);
