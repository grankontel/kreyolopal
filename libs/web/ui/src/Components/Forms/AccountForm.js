import React, { useState, useEffect } from 'react';
import { Button, Form, Progress } from 'react-bulma-components';
import { useZakari } from '@kreyolopal/react-zakari';

export const AccountForm = (props) => {
  const [loading, setLoading] = useState(true);
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const auth = useZakari();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (auth !== null) getProfile();
  }, [auth]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const getProfile = async () => {
    try {
      setLoading(true);

      let {
        data: { profile },
      } = await auth.getProfile();

      if (profile) {
        setFirstname(profile.firstname);
        setLastname(profile.lastname);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    props.onSubmit({ profile: { firstname, lastname }, setLoading });
  };

  return (
    <div aria-live="polite">
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
            <Form.Label>Prénom</Form.Label>
            <Form.Control>
              <Form.Input
                id="firstname"
                type="text"
                value={firstname || ''}
                autoComplete='given-name'
                onChange={(e) => setFirstname(e.target.value)}
              />
            </Form.Control>
          </Form.Field>
          <Form.Field>
            <Form.Label>Nom</Form.Label>
            <Form.Control>
              <Form.Input
                id="lastname  "
                type="text"
                value={lastname || ''}
                autoComplete='family-name'
                onChange={(e) => setLastname(e.target.value)}
              />
            </Form.Control>
          </Form.Field>
          <Button.Group>
            <Button color="primary" disabled={loading}>
              Mettre à jour
            </Button>
          </Button.Group>
        </form>
      )}
    </div>
  );
};

export default AccountForm;
