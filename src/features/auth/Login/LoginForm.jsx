import React from 'react';
import { Form, Segment, Button, Label, Divider } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import TextInput from '../../../app/common/form/TextInput';
import { login, socialLogin } from '../authActions'
import SocialLogin from '../SocialLogin/SocialLogin'

const actions = {
    login,
    socialLogin
}

const LoginForm = ({login, socialLogin, handleSubmit, error}) => {
  return (
    <Form size="large" onSubmit={handleSubmit(login)}>
    {error && <Label basic color='red'>{error}</Label>}
      <Segment>
        <Field
          name="email"
          component={TextInput}
          type="text"
          placeholder="Email Address"
        />
        <Field
          name="password"
          component={TextInput}
          type="password"
          placeholder="password"
        />
        <Button fluid size="large" color="teal">
          Login
        </Button>
        <Divider horizontal> or </Divider>
        <SocialLogin socialLogin={socialLogin}/>
      </Segment>
    </Form>
  );
};

export default connect(null, actions)(reduxForm({form: 'loginForm'})(LoginForm));