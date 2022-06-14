import React, { useState } from 'react'
import {
  Box,
  Columns,
  Heading,
  Form,
  Notification,
  Section,
  Button,
} from 'react-bulma-components'
import {FormField} from '@kreyolopal/web-ui'
import StandardPage from '../layouts/StandardPage'
const axios = require('axios').default

export const ContactPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [notif, setNotif] = useState({ color: 'warning', message: '' })

  const clearMessage = () => {
    setNotif({ color: notif.color, message: '' })
  }

  const onMessageChange = (e) => setMessage(e.target.value)

  const handleSubmit = (e) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      clearMessage()

      axios
        .post('/backend/contact', { firstname, lastname, email, subject, message })
        .then(
          () => {
            setNotif({ color: 'success', message: 'Opération réussie' })
          },
          (error) => {
            setNotif({ color: 'danger', message: error?.error || error })
          }
        )
    } catch (error) {
      setNotif({ color: 'danger', message: error?.error || error })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <StandardPage lang="cpf_GP">
      <StandardPage.Head
        title="Kreyolopal | Pran kontak"
        description="Correcteur orthographique en ligne pour le créole."
      />
      <Section>
        <Heading size={2} renderAs="h1">
         Contact
        </Heading>

        <Box className="contact_form">
          {notif.message.length > 0 ? (
            <Notification color={notif.color}>
              {notif.message}
              <Button remove onClick={() => clearMessage()} />
            </Notification>
          ) : (
            ''
          )}
          <form onSubmit={handleSubmit}>
            <Columns>
              <Columns.Column size="half">
                <FormField
                  label="Prénom"
                  name="fname"
                  type="text"
                  value={firstname}
                  autoComplete="given-name"
                  setValue={setFirstname}
                  required
                />
              </Columns.Column>
              <Columns.Column size="half">
                <FormField
                  label="Nom"
                  name="lname"
                  type="text"
                  value={lastname}
                  autoComplete="family-name"
                  setValue={setLastname}
                  required
                />
              </Columns.Column>

              <Columns.Column size="full">
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  setValue={setEmail}
                  required
                />
              </Columns.Column>

              <Columns.Column size="full">
                <FormField
                  label="Sujet"
                  name="subject"
                  type="text"
                  value={subject}
                  setValue={setSubject}
                  required
                />
              </Columns.Column>

              <Columns.Column size="full">
                <Form.Field>
                  <Form.Label>Message</Form.Label>
                  <Form.Control>
                    <Form.Textarea
                      name="MESSAGE"
                      value={message}
                      required
                      onChange={onMessageChange}
                    />
                  </Form.Control>
                </Form.Field>
              </Columns.Column>
            </Columns>
            <Button.Group align="right">
              <Button loading={isLoading} color="primary">
                Voyé-y
              </Button>
            </Button.Group>
          </form>
        </Box>
      </Section>
    </StandardPage>
  )
}

export default ContactPage
