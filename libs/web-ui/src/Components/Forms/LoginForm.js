import { useState } from 'react';
import { Button, Content } from 'react-bulma-components';
import { Link } from 'react-router-dom';
import FormField from '../FormField';

export const LoginForm = (props) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const btnLabel = props.buttonLabel || 'Login';

  const handleLogin = async (e) => {
    e.preventDefault();

    props.onSubmit({ email, password: pwd, setLoading });
  };

  return (
    <form onSubmit={handleLogin}>
      <FormField
        label="Email"
        name="email"
        type="email"
        value={email}
        autoComplete="email"
        setValue={setEmail}
        required
      />
      <FormField
        label="Password"
        name="pwd"
        type="password"
        value={pwd}
        autoComplete="current-password"
        setValue={setPwd}
        required
      />

      <Button.Group align="right">
        <Content>
          Pas encore de compte ?{' '}
          <Link to="/register">Inscrivez-vous ici !</Link>
        </Content>

        <Button loading={loading} color="primary">
          {btnLabel}
        </Button>
      </Button.Group>
    </form>
  );
};

export default LoginForm;
