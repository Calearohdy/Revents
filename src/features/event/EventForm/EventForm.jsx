/*global google*/
import React, { Component } from 'react';
import { Segment, Form, Button, Grid, Header } from "semantic-ui-react";
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import { withFirestore } from 'react-redux-firebase';
import Script from 'react-load-script'; 
import { createEvent, updateEvent, cancelToggle } from '../eventActions';
import { composeValidators, combineValidators, isRequired, hasLengthGreaterThan } from 'revalidate';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import TextInput from '../../../app/common/form/TextInput';
import TextArea from '../../../app/common/form/TextArea';
import SelectInput from '../../../app/common/form/SelectInput';
import DateInput from '../../../app/common/form/DateInput';
import PlaceInput from '../../../app/common/form/PlaceInput';


const mapState = (state) => {

  let event = {}

  if (state.firestore.ordered.events && state.firestore.ordered.events[0]) {
    event = state.firestore.ordered.events[0]
  }

  return {
    initialValues: event,
    event
  }
}

const actions = { // this functions get added to the component props
  createEvent,
  updateEvent,
  cancelToggle
}

const category = [
  { key: 'drinks', text: 'Drinks', value: 'drinks' },
  { key: 'culture', text: 'Culture', value: 'culture' },
  { key: 'film', text: 'Film', value: 'film' },
  { key: 'food', text: 'Food', value: 'food' },
  { key: 'music', text: 'Music', value: 'music' },
  { key: 'travel', text: 'Travel', value: 'travel' },
];

const validate = combineValidators({
  title: isRequired({ message: 'Title is required' }),
  category: isRequired({ message: 'Category is required' }),
  description: composeValidators(
    isRequired({ message: 'Please Describe your Event' }),
    hasLengthGreaterThan(4)({ message: 'Minimum 5 Characters' })
  )(),
  city: isRequired('city'),
  venue: isRequired('venue'),
  date: isRequired('date')
})
class EventForm extends Component {

  state = {
    cityLatLng: {},
    venueLatLng: {},
    scriptLoaded: false
  }

  async componentDidMount() {
    const {firestore, match} = this.props;
    let event = await firestore.get(`events/${match.params.id}`)

    if(event.exists) {
      this.setState({
        venueLatLng: event.data().venueLatLng
      })
    }
  }

  handScriptLoaded = () => this.setState({scriptLoaded: true})

  handleCitySelect = (selectedCity) => {
    geocodeByAddress(selectedCity)  // requires a promise
      .then(results => getLatLng(results[0]))
      .then(latlng => {
        this.setState({
          cityLatLng: latlng
        })
      })
      .then(() => {
        this.props.change('city', selectedCity)
      })
  };

  handleVenueSelect = selectedVenue => {
    geocodeByAddress(selectedVenue)  // requires a promise
      .then(results => getLatLng(results[0]))
      .then(latlng => {
        this.setState({
          venueLatLng: latlng
        })
      })
      .then(() => {
        this.props.change('venue', selectedVenue)
      })
  };

  onFormSubmit = (values) => {
    values.venueLatLng = this.state.venueLatLng;
    if (this.props.initialValues.id) {
      this.props.updateEvent(values);
      this.props.history.goBack();
    } else {
      this.props.createEvent(values)
      this.props.history.push('/events')
    }
  }

  onInputChange = (evt) => {
    const newEvent = this.state.event
    newEvent[evt.target.name] = evt.target.value
    this.setState({
      event: newEvent
    })
  }

  render() {
    const { invalid, submitting, pristine, event, cancelToggle } = this.props; // destructured props
    const key = 'AIzaSyBqdEbDIxbDCP8Sy4oR1QVHZdc1Sz5FHu8';
    return (
      <Grid>
        <Script 
            url={`https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`}
            onLoad={this.handScriptLoaded}
        />
        <Grid.Column width={10}>
          <Segment>
            <Header sub color='teal' content='Event Details' />
            <Form onSubmit={this.props.handleSubmit(this.onFormSubmit)}>
              <Field name='title' type='text' component={TextInput} placeholder='Name of Event' />
              <Field name='category' type='text' component={SelectInput} options={category} placeholder='Event Category' />
              <Field name='description' type='text' component={TextArea} rows={3} placeholder='Event Description' />
              <Header sub color='teal' content='Event Location Detail' />
              <Field name='city' type='text' component={PlaceInput} options={{ types: ['(cities)'] }} placeholder='City' onSelect={this.handleCitySelect} />
              {this.state.scriptLoaded && 
              <Field 
                name='venue' 
                type='text' 
                component={PlaceInput} 
                options={{ location: new google.maps.LatLng(this.state.cityLatLng), radius: 1000, types: ['establishment'] }} 
                placeholder='Event Venue'
                onSelect={this.handleVenueSelect} 
              />
              }
              <Field name='date' type='text' component={DateInput} dateFormat='YYYY-MM-DD HH:mm' timeFormat='HH:mm' showTimeSelect placeholder='Event Date' />
              <hr />
              <Button disabled={invalid || submitting || pristine} positive type="submit">
                Submit
          </Button>
              <Button onClick={this.props.history.goBack} type="button">Cancel</Button>
              <Button
                onClick={() => cancelToggle(!event.cancelled, event.id)} 
                type='button'
                color={event.cancelled ? 'green' : 'red'}
                floated='right'
                content={event.cancelled ? 'Reactiviate Event' : 'Cancel event'}
              />
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    )
  }
}
export default withFirestore(connect(mapState, actions)(reduxForm({ form: 'eventForm', enableReinitialize: true, validate })(EventForm)));

// 