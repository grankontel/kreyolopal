import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zakari } from '@kreyolopal/zakari';

const ZakContext = React.createContext(null);

const Protected = ({ to, children }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const auth = React.useContext(ZakContext);
  const navigate = useNavigate();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (auth !== null) {
      setLoggedIn(auth?.isLoggedIn());
      if (!auth?.isLoggedIn()) navigate(to);

      auth.onUserChange((_auth, user) => {
        setLoggedIn(user !== null);
        if (user === null) navigate(to);
      });
      
    }
  }, [auth]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return isLoggedIn ? children : '';
};

export function ZakProvider(props) {
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (client === null) setClient(
      typeof window !== 'undefined' && window
        ? new Zakari(window.location.origin)
        : null
    );
  }, []);
  return (
    <ZakContext.Provider value={client}>{props.children}</ZakContext.Provider>
  );
}

ZakProvider.Protected = Protected;

export function useZakari() {
  return React.useContext(ZakContext);
}

export default ZakProvider;
