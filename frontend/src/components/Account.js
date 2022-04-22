import { useState, useEffect } from 'react'
import { Box, Button, Form, Progress } from 'react-bulma-components'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthProvider'

const Account = ({ session }) => {
  const [loading, setLoading] = useState(true)
  const [firstname, setFirstname] = useState(null)
  const [lastname, setLastname] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)
  const auth = useAuth()

  console.log('session', session)
  useEffect(() => {
    getProfile()
  }, [session])

  const getProfile = async () => {
    try {
      setLoading(true)
      const user = supabase.auth.user()
      console.log('user', user)

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`firstname, lastname, website, avatar_url`)
        .eq('id', user.id)
        .single()

      console.log('result', { data, error, status })
      /*       if (error && status !== 406) {
        throw error
      }
 */
      if (data) {
        setFirstname(data.firstname)
        setLastname(data.lastname)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      const user = supabase.auth.user()

      const updates = {
        id: user.id,
        firstname,
        lastname,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      let { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Don't return the value after inserting
      })

      if (error) {
        throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div aria-live="polite">
      {loading ? (
        <Progress max={100} />
      ) : (
        <Box>
          <form onSubmit={updateProfile} className="form-account">
            <Form.Field>
              <Form.Label>Email</Form.Label>
              <Form.Control>
                <Form.Input readOnly value={session.user.email} />
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
            <Form.Field>
              <Form.Label>Website</Form.Label>
              <Form.Control>
                <Form.Input
                  id="website"
                  type="url"
                  value={website || ''}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </Form.Control>
            </Form.Field>
            <Button.Group>
              <Button color="primary" disabled={loading}>
                Update profile
              </Button>
            </Button.Group>
          </form>
        </Box>
      )}

      <Button color="warning" onClick={() => auth.signOut()}>
        Sign Out
      </Button>
    </div>
  )
}

export default Account
