import React, { Component } from 'react';
import { Grid, Loader } from 'semantic-ui-react';
import EventList from '../EventList/EventList';
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase';
import { getEventsForDashboard } from '../eventActions';
import LoadingComponent from '../../../app/layout/LoadingComponent'
import EventActivity from '../EventActivity/EventActivity';

const query = [
    {
        collection: 'activity',
        orderBy: ['timestamp', 'desc'],
        limit: 5

    }
]

const mapState = (state) => ({
    events: state.events,
    loading: state.async.loading,
    activities: state.firestore.ordered.activity
})

const actions = {
    getEventsForDashboard
}

class EventDashboard extends Component {

    state = {
        moreEvents: false,
        loadingInitial: true,
        loadedEvents: [],
        contextRef: []
    }

    async componentDidMount() {
        // If you need to load data from a remote endpoint, this is a good place to instantiate the network request.
        let next = await this.props.getEventsForDashboard();
        console.log(next)
        const {events} = this.props;

        console.log(events)
        // retrieves documents from firebase query
        if (next && next.docs && next.docs.length > 1) { // conditional to check if there will be more events loading in
            this.setState({
                moreEvents: true, // local state management to allow the user to get more events
                loadingInitial: false
            })
        }
    }

    // invoke before a mounted component receives new props. If you need to update the state in response to prop changes
    componentWillReceiveProps(nextProps) {
        if (this.props.events !== nextProps.events) {
            this.setState({
                loadedEvents: [...this.state.loadedEvents, ...nextProps.events] // create a new array and pass to new array
            })
        }
    }

    getNextEvents = async () => {
        const {events} = this.props; // getting the last of the events so it can start after, and return the next batch
        let lastEvent = events && events[events.length -1]; // checks the previous event in the array
        console.log(lastEvent)
        
        let next = await this.props.getEventsForDashboard(lastEvent);
        console.log(next);
        if (next && next.docs && next.docs.length <= 1) { // conditional to check if there will be more events loading in
            this.setState({
                moreEvents: false // local state management to allow the user to get more events
            })
        }
    }

    handleContextRef = contextRef => {
        this.setState({contextRef})
    }

    render() {
        const { loading, profile, activities } = this.props;
        const {moreEvents, loadedEvents} = this.state;
        if(this.state.loadingInitial) return <LoadingComponent /> // only calls loading component on intial reload
        return (
            <Grid>
                <Grid.Column width={10}>
                <div ref={this.handleContextRef}>
                    <EventList 
                        loading={loading} 
                        events={loadedEvents} 
                        profile={profile} 
                        moreEvents={moreEvents} 
                        getNextEvents={this.getNextEvents}
                        />
                </div>

                </Grid.Column>
                <Grid.Column width={6}>
                    <EventActivity activities={activities} contextRef={this.state.contextRef}/>
                </Grid.Column>
                <Grid.Column width={10}>
                    <Loader active={loading}/>
                </Grid.Column>
            </Grid>
        )
    }
}

export default connect(mapState, actions)(firestoreConnect(query)(EventDashboard));