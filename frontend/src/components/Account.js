import { useState, useEffect } from 'react'
import {  Button, Form, Progress } from 'react-bulma-components'
import { useZakari } from './ZakProvider'

const Account = (props) => {
  const [loading, setLoading] = useState(true)
  const [firstname, setFirstname] = useState(null)
  const [lastname, setLastname] = useState(null)
  const auth = useZakari()

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
      setLoading(true)
      const user = auth.user
      console.log('user', user)

      let {
        data: { profile },
      } = await auth.getProfile()
      console.log(profile)

      if (profile) {
        setFirstname(profile.firstname)
        setLastname(profile.lastname)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()

    props.onSubmit({ profile: { firstname, lastname }, setLoading })
  }

  return (
    <div aria-live="polite" >
      {loading ? (
        <Progress max={100} />
      ) : (
          <form onSubmit={updateProfile} className="account_form">
            <Form.Field>
              <Form.Label>Email</Form.Label>
              <Form.Control>
                <Form.Input readOnly value={auth.user.email} />
              </Form.Control>
            </Form.Field>
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
            <Button.Group>
              <Button color="primary" disabled={loading}>
                Update profile
              </Button>
            </Button.Group>
          </form>
      )}


    </div>
  )
}

export default Account
