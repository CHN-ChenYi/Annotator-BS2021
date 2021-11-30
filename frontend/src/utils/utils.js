import axios from 'axios';
import md5 from 'js-md5';
import { useSnackbar } from 'notistack';
import React, { useState, useContext, createContext } from 'react';

const UtilsContext = createContext();
export const useUtils = () => useContext(UtilsContext);

// eslint-disable-next-line
export function ProvideUtils({ children }) {
  const value = useProvideUtils();
  return <UtilsContext.Provider value={value}>{children}</UtilsContext.Provider>;
}

const useProvideUtils = () => {
  const { enqueueSnackbar } = useSnackbar();

  const alertBySnackbar = (message, variant) => {
    enqueueSnackbar(message, { variant });
  };

  const fetch = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 5000,
    withCredentials: true
  });

  fetch.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) alertBySnackbar(error.response.data, 'error');
      else alertBySnackbar(error.message, 'error');
      return error;
    }
  );

  const [user, setUser] = useState(null);

  const signin = (email, password) => {
    fetch
      .post('/user/login', {
        email,
        password
      })
      .then((response) => {
        setUser({
          id: response.data.id,
          email: response.data.email,
          username: response.data.username,
          photoURL: `https://www.gravatar.com/avatar/${md5(response.data.email.toLowerCase())}`
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const signup = (email, username, password) => {
    fetch
      .post('/user', {
        email,
        username,
        password
      })
      .then((response) => {
        setUser({
          id: response.data.id,
          email: response.data.email,
          username: response.data.username,
          photoURL: `https://www.gravatar.com/avatar/${md5(response.data.email.toLowerCase())}`
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const signout = () => {
    fetch.post('/user/logout').catch((error) => {
      console.log(error);
    });
    setUser(false);
  };

  return { fetch, alertBySnackbar, user, signin, signup, signout };
};
