import React, { useState } from 'react'
import { Form, Button } from 'react-bulma-components'

const LoginForm = (props) => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const btnLabel = props.buttonLabel || 'Login'

  const handleLogin = async (e) => {
    e.preventDefault()

    props.onSubmit({ email, password: pwd, setLoading })
  }

  return (
    <form onSubmit={handleLogin}>
      <Form.Field>
        <Form.Label>Email</Form.Label>
        <Form.Control>
          <Form.Input
            name="email"
            type="email"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Control>
      </Form.Field>

      <Form.Field>
        <Form.Label>Password</Form.Label>
        <Form.Control>
          <Form.Input
            name="pwd"
            type="password"
            value={pwd}
            autoComplete="current-password"
            onChange={(e) => setPwd(e.target.value)}
            required
          />
        </Form.Control>
      </Form.Field>

      <Button.Group align="right">
        <Button color="primary">{btnLabel}</Button>
      </Button.Group>
    </form>
  )
}

export default LoginForm
