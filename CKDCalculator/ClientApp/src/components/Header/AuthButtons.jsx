import React, { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { resetUser } from '../../redux/actions';

function AuthButtons({ authPageToggler }) {
  const dispatch = useDispatch();

  const globalState = useSelector(({ user }) => {
    return { user: user };
  }, shallowEqual);

  const loggOut = useCallback(() => {
    fetch('/api/user/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.status === 'success') dispatch(resetUser());
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  let auth_logged_out = (
    <div className="header-auth-out">
      <div onClick={authPageToggler}>join us</div>
    </div>
  );

  let auth_logged_in = (
    <div className="header-auth-in">
      <Link to="/account" className="header-btn-section">
        <div className="account-btn header-btn"> account button</div>
        {/* <div>account</div> */}
      </Link>
      <div className="header-btn-section" onClick={loggOut}>
        <div className="logout-btn header-btn">logout button</div>
        {/* <div>logout</div> */}
      </div>
    </div>
  );

  return globalState.user !== null ? auth_logged_in : auth_logged_out;
}

export default AuthButtons;
