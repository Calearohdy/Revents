import React, { Component } from 'react'
import { Button, Divider, Form, Header, Segment, Dropdown } from 'semantic-ui-react';
import { Field, reduxForm } from 'redux-form';
import RadioInput from '../../../app/common/form/RadioInput';
import TextInput from '../../../app/common/form/TextInput';
import TextArea from '../../../app/common/form/TextArea';
import PlaceInput from '../../../app/common/form/PlaceInput';
import SelectInput from '../../../app/common/form/SelectInput';

const options = [
  { key: 'drinks', text: 'Drinks', value: 'drinks' },
  { key: 'culture', text: 'Culture', value: 'culture' },
  { key: 'film', text: 'Film', value: 'film' },
  { key: 'food', text: 'Food', value: 'food' },
  { key: 'music', text: 'Music', value: 'music' },
  { key: 'travel', text: 'Travel', value: 'travel' }
];
class AboutPage extends Component {

  state = { options }

  handleAddition = (e, { value }) => {
    this.setState({
      options: [{ text: value, value }, ...this.state.options],
    })
  }

  handleChange = (e, {value}) => this.setState({ currentValues: value })

  render() {
    const { pristine, submitting, handleSubmit, updateProfile } = this.props
    const {currentValues} = this.state;
    return (
      <Segment>
        <Header dividing size="large" content="About Me" />
        <p>Complete your profile to get the most out of this site</p>
        <Form onSubmit={handleSubmit(updateProfile)}>
          <Form.Group inline>
            <label>Tell us your status: </label>
            <Field name="status" component={RadioInput} type="radio" value="single" label="Single" />
            <Field
              name="status"
              component={RadioInput}
              type="radio"
              value="relationship"
              label="Relationship"
            />
            <Field
              name="status"
              component={RadioInput}
              type="radio"
              value="married"
              label="Married"
            />
          </Form.Group>
          <Divider />
          <label>Tell us about yourself</label>
          <Field name="about" component={TextArea} placeholder="About Me" />

          {/* <Dropdown 
            fluid
            selection
            options={this.state.options}
            value={currentValues}
            multiple
            allowAdditions
            onAddItem={this.handleAddition}
            onChange={this.handleChange}
            search
            placeholder="Select your interests"
          /> */}

          <Field
            name="interests"
            component={SelectInput}
            options={options}
            value="interests"
            multiple={true}
            allowAdditions={true}
            onAddItem={this.handleAddition}
            search={true}
            placeholder="Select your interests"
          />
          <Field
            width={8}
            name="occupation"
            type="text"
            component={TextInput}
            placeholder="Occupation"
          />
          <Field
            width={8}
            name="origin"
            options={{ types: ['(regions)'] }}
            component={PlaceInput}
            placeholder="Country of Origin"
          />
          <Divider />
          <Button disabled={pristine || submitting} size="large" positive content="Update Profile" />
        </Form>
      </Segment>
    );
  }
}

export default reduxForm({ form: 'userProfile', enableReinitialize: true, destroyOnUnmount: false })(AboutPage);