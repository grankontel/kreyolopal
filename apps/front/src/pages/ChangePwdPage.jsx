import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Notification,
  Progress,
  Section,
} from 'react-bulma-components';
import StandardPage from '../layouts/StandardPage';
import { useZakari } from '@kreyolopal/react-zakari';
import { FormField } from '@kreyolopal/web-ui';

export const ChangePwdPage = () => {
  const [init, setInit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [notif, setNotif] = useState({ color: 'warning', message: '' });
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const { token } = useParams();
  const auth = useZakari();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (auth !== null) getUserByToken();
  }, [auth]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const clearMessage = () => {
    setNotif({ color: 'warning', message: '' });
  };

  const getUserByToken = async () => {
    try {
      setInit(true);

      let {
        data: { profile },
      } = await auth.userByToken(token);

      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      if (error.code === 422)
        setNotif({
          color: 'warning',
          message: 'Ni fòt adan mésaj-la yo voyé ba-w la.',
        });
    } finally {
      setInit(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      clearMessage();
      auth.resetPassword(newPwd, newPwd2, token).then(
        () => {
          setNotif({ color: 'info', message: 'Mise à jour réussie' });
        },
        (reason) => {
          const code = reason?.code || 500;
          const msg =
            code === 500
              ? 'Erreur inconnue, veuillez essayer ultérieurement'
              : reason;
          setNotif({ color: 'danger', message: msg });
        }
      );
    } catch (error) {
      setNotif({ color: 'danger', message: error?.error || error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StandardPage lang="cpf_GP">
      <StandardPage.Head
        title="Kreyolopal | Chanjé modpas"
        description="Correcteur orthographique en ligne pour le créole."
      />
      <Section>
        <Heading size={2} renderAs="h1">
          Chanjé modpas a-w
        </Heading>
        {notif.message.length > 0 ? (
          <Notification color={notif.color}>
            {notif.message}
            <Button remove onClick={() => clearMessage()} />
          </Notification>
        ) : (
          ''
        )}

        {init ? (
          <Progress max={100} />
        ) : user === null ? (
          'user is null '
        ) : (
          <div className="account_box">
            <Box>
              <Heading id="profile" size={3} renderAs="h2">
                Byenbonjou {user.firstname}
              </Heading>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  disabled
                  value={user.email}
                  hidden
                  autoComplete="email"
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
            </Box>
          </div>
        )}
      </Section>
    </StandardPage>
  );
};

export default ChangePwdPage;
