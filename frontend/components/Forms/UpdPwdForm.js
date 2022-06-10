import React, { useState } from 'react'
import { Button, Progress } from 'react-bulma-components'
import FormField from '../FormField'

const UpdPwdForm = (props) => {
  const [loading, setLoading] = useState(false)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [newPwd2, setNewPwd2] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    props.onSubmit({
      data: {
        currentPassword: currentPwd,
        newPassword: newPwd,
        verification: newPwd2,
      },
      setLoading,
    })
  }

  return (
    <div className="update_form">
      {loading ? (
        <Progress max={100} />
      ) : (
        <form onSubmit={handleSubmit}>
          <FormField
            label="Mot de passe actuel"
            name="currentPwd"
            type="password"
            value={currentPwd}
            autoComplete="current-password"
            setValue={setCurrentPwd}
          />
          <FormField
            label="Nouveau mot de passe"
            name="newPwd"
            type="password"
            value={newPwd}
            autoComplete="new-password"
            setValue={setNewPwd}
          />
          <FormField
            label="Vérification"
            name="newPwd2"
            type="password"
            value={newPwd2}
            setValue={setNewPwd2}
          />
          <Button.Group>
            <Button color="primary" disabled={loading}>
              Changer mon mot de passe
            </Button>
          </Button.Group>
        </form>
      )}
    </div>
  )
}

export default UpdPwdForm
