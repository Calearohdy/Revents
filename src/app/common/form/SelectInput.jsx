import { Form, Label, Select } from 'semantic-ui-react';
import React from 'react'

const SelectInput = ({input, type, placeholder, multiple, options, allowAdditions, search, meta: {touched, error}}) => {
  return (
    <Form.Field error={touched && !!error}>
    <Select 
        value={input.value || null}
        onChange={(e, data)=> input.onChange(data.value)}
        placeholder={placeholder}
        type={type}
        options={options}
        multiple={multiple}
        allowAdditions={allowAdditions}
        search={search}
    />
    {touched && error && <Label basic color='red'>{error}</Label>}
     </Form.Field>
  )
}

export default SelectInput
