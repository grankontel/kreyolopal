import React from 'react'
import { Form } from 'react-bulma-components'

const FormField = (props) => {
  const { label, value, name, type, autoComplete, handler } = props
  return (
    <Form.Field>
      <Form.Label>{label}</Form.Label>
      <Form.Control>
        <Form.Input
          name={name}
          type={type}
          value={value}
          autoComplete={autoComplete || ''}
          onChange={(e) => handler(e.target.value)}
          required
        />
      </Form.Control>
    </Form.Field>
  )
}

export default FormField
