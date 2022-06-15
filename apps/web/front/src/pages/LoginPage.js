import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '@kreyolopal/web-ui';
import StandardPage from '../layouts/StandardPage';
import {
  Box,
  Button,
  Heading,
  Notification,
  Section,
} from 'react-bulma-components';
import { useZakari } from '@kreyolopal/react-zakari';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const [message, setMessage] = useState('');
  const auth = useZakari();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth !== null && auth.user !== null) {
      navigate('/');
    }
  });

  const onSubmit = async ({ email, password, setLoading }) => {
    try {
      setLoading(true);
      setMessage('');
      auth.signIn(email, password).then(
        () => {
          navigate('/');
        },
        (reason) => {
          const code = reason?.code || 500;
          const msg =
            code === 500
              ? 'Erreur inconnue, veuillez essayer ultérieurement'
              : 'Identifiant inconnu ou mot de passe incorrect';
          setMessage(msg);
        }
      );
    } catch (error) {
      setMessage(error?.error || error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <StandardPage>
      <StandardPage.Head
        title="Kreyolopal | Login"
        description="Utiliser les technologies d'aujourd'hui pour encourager, améliorer et diffuser l'écriture du créole."
      />
      <Section>
        <Box className="login_form">
          <Heading size={2} renderAs="h1">
            Log in
          </Heading>

          {message.length > 0 ? (
            <Notification color="danger">
              {message}
              <Button remove onClick={() => setMessage('')} />
            </Notification>
          ) : (
            ''
          )}

          <LoginForm buttonLabel="Login" onSubmit={onSubmit} />
          <hr />
          <div className="has-text-centered">
            <Link to="/resetpwd/request">An obliyé modpas an-mwen !</Link>
          </div>
        </Box>
      </Section>
    </StandardPage>
  );
};

export default LoginPage;
