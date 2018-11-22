import React from 'react'
import { Form, Label } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

const DateInput = ({input: {value, onChange, onBlur, ...restInput}, width, placeholder, meta: {touched, error}, ...rest}) => {

  if (value) { // this means the date is not null
    value = moment(value, 'X')
  }
  return (
    <div>
      <Form.Field error={touched && !!error} width={width}>
        <DatePicker
        {...rest}
        placeholderText={placeholder}
        selected={value ? moment(value) : null}
        onChange={onChange}
        onBlur={() => onBlur()}
        {...restInput}
        />
        {touched && error && <Label basic color='red'>{error}</Label>}
      </Form.Field>
    </div>
  )
}

export default DateInput
