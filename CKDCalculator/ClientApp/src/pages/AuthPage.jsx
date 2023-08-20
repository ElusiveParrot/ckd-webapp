import React, { useState } from 'react';
import { useCallback } from 'react';

import '../assets/styles/auth.css';
import { Register, Login } from '../components';

function AuthPage({ showHideAuthPage }) {
  const urlParams = new URLSearchParams(window.location.search);

  const [state, setState] = useState({
    isRegistered: urlParams.get('From') === 'email',
  });

  const authPageToggler = useCallback(() => {
    setState({ ...state, isRegistered: !state.isRegistered });
  }, [state.isRegistered]);

  return (
    <div className="auth-pg">
      {state.isRegistered ? (
        <Register authPageToggler={authPageToggler} showHideAuthPage={showHideAuthPage} />
      ) : (
        <Login authPageToggler={authPageToggler} showHideAuthPage={showHideAuthPage} />
      )}
    </div>
  );
}

export default AuthPage;
