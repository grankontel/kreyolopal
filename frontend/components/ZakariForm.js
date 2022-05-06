import React, { useState } from 'react'
import {
  Box,
  Button,
  Form,
  Message,
  Notification,
} from 'react-bulma-components'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useZakari } from '../components/ZakProvider'

function addEmphasis(src) {
  const strArray = Array.from(src)

  var inEm = false
  const result = strArray
    .map((c) => {
      var rep = c
      if (c === '~') {
        rep = inEm ? '</mark>' : '<mark>'
        inEm = !inEm
      }
      return rep
    })
    .join('')
  return result
}

const ZakariForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const [request, setRequest] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [response, setResponse] = useState('')

  const eraseErrorMessage = () => setErrorMessage('')
  const auth = useZakari()

  const handleSubmit = (e) => {
    e.preventDefault()

    setErrorMessage('')
    setResponse('')
    setIsLoading(true)
    setCopied(false)

    try {
      const resp = auth.spellcheck('GP', request)

      resp.then((data) => {
        setIsLoading(false)

        if (data.errors !== undefined) {
          setErrorMessage('Erreur de zakari')
        } else {
          const msg = addEmphasis(data.response.message)
          setResponse(msg)
        }
      })
    } catch (error) {
      setIsLoading(false)
      setErrorMessage(error)
    }
  }

  return (
    <Box className="zakari_form">
      <form onSubmit={handleSubmit}>
        <Form.Field>
          <Form.Label>Tèks pou korijé</Form.Label>
          <Form.Control>
            <Form.Textarea
              name="source"
              value={request}
              onChange={(e) => {
                setRequest(e.target.value)
                setCopied(false)
              }}
              required
            />
          </Form.Control>
        </Form.Field>
        <Message className='zakari_repons'>
          <Message.Header>Répons</Message.Header>
          <Message.Body dangerouslySetInnerHTML={{__html: response}}></Message.Body>
        </Message>
        {errorMessage.length > 0 && (
          <Notification className="error" mt={2} light color="danger">
            <Button remove onClick={eraseErrorMessage} />
            {errorMessage}
          </Notification>
        )}
        <hr />
        <Button.Group align="right">
          <CopyToClipboard text={response} onCopy={() => setCopied(true)}>
            <Button
              color={copied ? 'info' : 'light'}
              disabled={response === ''}
            >
              {copied ? 'I adan !' : 'Kopyé'}
            </Button>
          </CopyToClipboard>
          <Button
            color="primary"
            disabled={!isLoading && request.length < 2}
            loading={isLoading}
          >
            Korijé
          </Button>
        </Button.Group>
      </form>
    </Box>
  )
}

export default ZakariForm
