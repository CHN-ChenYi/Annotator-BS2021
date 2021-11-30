// https://usehooks.com/useAuth/
import axios from 'axios';
import React, { useState, useContext, createContext } from 'react';

const authContext = createContext();

// eslint-disable-next-line
export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => useContext(authContext);

function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = (email, password) => {
    axios
      .post('http://localhost:8080/api/user/login', {
        email,
        password
      })
      .then((response) => {
        setUser({
          id: response.data.id,
          email: response.data.email,
          username: response.data.username
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const signup = (email, username, password) => {
    axios
      .post('http://localhost:8080/api/user', {
        email,
        username,
        password
      })
      .then((response) => {
        setUser({
          id: response.data.id,
          email: response.data.email,
          username: response.data.username
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const signout = () => {
    axios.post('http://localhost:8080/api/user/logout').catch((error) => {
      console.log(error);
    });
    setUser(false);
  };

  return {
    user,
    signin,
    signup,
    signout
  };
}
