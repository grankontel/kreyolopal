import { useState } from 'react'
import { Button, Form, Progress } from 'react-bulma-components'

const RegisterForm = (props) => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [firstname, setFirstname] = useState(null)
  const [lastname, setLastname] = useState(null)

  const registerUser = async (e) => {
    e.preventDefault()

    props.onSubmit({
      user: {
        firstname,
        lastname,
        email,
        password1: pwd,
        password2: pwd2,
      },
      setLoading,
    })
  }

  return (
    <div aria-live="polite">
      {loading ? (
        <Progress max={100} />
      ) : (
        <form onSubmit={registerUser} className="register_form">
          <Form.Field>
            <Form.Label>First name</Form.Label>
            <Form.Control>
              <Form.Input
                id="firstname"
                type="text"
                value={firstname || ''}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </Form.Control>
          </Form.Field>
          <Form.Field>
            <Form.Label>Last name</Form.Label>
            <Form.Control>
              <Form.Input
                id="lastname  "
                type="text"
                value={lastname || ''}
                onChange={(e) => setLastname(e.target.value)}
              />
            </Form.Control>
          </Form.Field>

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
                autoComplete="new-password"
                onChange={(e) => setPwd(e.target.value)}
                required
              />
            </Form.Control>
          </Form.Field>

          <Form.Field>
            <Form.Label>Verify password</Form.Label>
            <Form.Control>
              <Form.Input
                name="pwd2"
                type="password"
                value={pwd2}
                autoComplete="verify-password"
                onChange={(e) => setPwd2(e.target.value)}
                required
                color={pwd2?.length > 0 && pwd2 !== pwd ? 'danger' : 'success'}
              />
            </Form.Control>
          </Form.Field>

          <hr />
          <Button.Group>
            <Button color="primary" disabled={loading}>
              Register
            </Button>
          </Button.Group>
        </form>
      )}
    </div>
  )
}

export default RegisterForm
