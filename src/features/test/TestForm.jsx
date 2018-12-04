import React, { Component } from 'react'
import { Segment, Form, Button, Grid, Header } from "semantic-ui-react";
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import TextInput from '../../app/common/form/TextInput';
//import TextArea from '../../app/common/form/TextArea';
import SelectInput from '../../app/common/form/SelectInput';
import {addUser} from './testActions'
import { closeModal } from '../modals/modalActions'

const actions = {
    addUser,
    closeModal
}

const mapState = (state) => {

    let event = {}
  
    if (state.firestore.ordered.events && state.firestore.ordered.events[0]) {
      event = state.firestore.ordered.events[0]
    }
  
    return {
      initialValues: event,
      event,
      loading: state.async.loading
    }
  }

  const category = [
    { key: 'yes', text: 'Yes', value: 'yes' },
    { key: 'no', text: 'No', value: 'no' }
  ];

class TestForm extends Component {

  onFormSubmit = values => {
    this.props.addUser(values);
  }

  render() {
    const { invalid, submitting, pristine, loading, closeModal } = this.props; // deconstructured

    return (
    <Grid>
        <Grid.Column width={10}>
          <Segment>
            <Header sub color='teal' content='User Details' />
            <Form onSubmit={this.props.handleSubmit(this.onFormSubmit)}>
              <Field name='title' type='text' component={TextInput} placeholder='User Name' />
              <Field name='email' type='text' component={TextInput} placeholder='E-mail Address' />
              <Field name='plan' type='text' component={SelectInput} options={category} placeholder='Premium Plan' />
              <hr />
                <Button loading={loading} disabled={invalid || submitting || pristine} positive type="submit">
                Submit
                </Button>
              <Button onClick={()=> closeModal()} disabled={loading} type="button">Cancel</Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    )
  }
}
export default connect(mapState, actions)(reduxForm({ form: 'testForm', destroyOnUnmount: false })(TestForm))