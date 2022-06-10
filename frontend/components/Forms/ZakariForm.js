import React, { useState } from 'react'
import {
  Box,
  Button,
  Form,
  Icon,
  Message,
  Notification,
} from 'react-bulma-components'
import * as feather from 'feather-icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useZakari } from '../ZakProvider'
import StarRating from '../StarRating'

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
  const [response, setResponse] = useState(null)

  const eraseErrorMessage = () => setErrorMessage('')
  const auth = useZakari()

  const rateCorrection = (note) => {
    if (response?.id === undefined) return
    setIsLoading(true)
    try {
      const resp = auth.rateCorrection(response?.id, { rating: note })

      resp.then((data) => {
        setIsLoading(false)

        if (data.errors !== undefined) {
          setErrorMessage('Erreur de zakari')
        }
      })
    } catch (error) {
      setIsLoading(false)
      setErrorMessage(error)
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()

    setErrorMessage('')
    setResponse(null)
    setIsLoading(true)
    setCopied(false)

    try {
      const resp = auth.spellcheck('GP', request)

      resp.then((data) => {
        setIsLoading(false)

        if (data.errors !== undefined) {
          setErrorMessage('Erreur de zakari')
        } else {
          const result = data.response
          result.html = addEmphasis(result.message)

          setResponse(result)
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
        <Message className="zakari_repons">
          <Message.Header>Répons</Message.Header>
          <Message.Body
            dangerouslySetInnerHTML={{ __html: response?.html }}
          ></Message.Body>
        </Message>
        {errorMessage.length > 0 && (
          <Notification className="error" mt={2} light color="danger">
            <Button remove onClick={eraseErrorMessage} />
            {errorMessage}
          </Notification>
        )}
        <hr />
        <Button.Group align="right">
          {response === null ? null : (
            <Icon
              size={24}
              data-tooltip={`Kliké sé zétwal-la pou mèt on nòt,\n sa ké rédé-nou amélyoré zouti-la.`}
              className="has-tooltip-arrow"
              color="success"
              dangerouslySetInnerHTML={{
                __html: feather.icons.info.toSvg({
                  height: '1em',
                  width: '1em',
                }),
              }}
            />
          )}
          <StarRating hidden={response === null} onRated={rateCorrection} />
          <CopyToClipboard
            text={response?.message}
            onCopy={() => setCopied(true)}
          >
            <Button
              color={copied ? 'info' : 'light'}
              disabled={response === null}
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
