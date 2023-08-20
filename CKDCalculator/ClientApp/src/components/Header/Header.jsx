import React, { useCallback, useState } from 'react';

import { AuthPage } from '../../pages';
import AuthButtons from './AuthButtons';

import '../../assets/styles/header.css';
import { HashLink } from 'react-router-hash-link';
import { Link } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';

function Header({ appLocalState, setAppState }) {
  const [localState, setLocalState] = useState({
    isMenuToggled: false,
  });

  const accessLevel = useSelector(
    ({ user }) => (user === null ? 0 : user.accessLevel),
    shallowEqual,
  );

  const toggleMenu = useCallback(() => {
    setLocalState({ ...localState, isMenuToggled: !localState.isMenuToggled });
  }, [localState.isMenuToggled]);

  const authPageToggler = useCallback(() => {
    setAppState({ ...appLocalState, isAuthToggled: !appLocalState.isAuthToggled });
  }, [appLocalState.isAuthToggled, setAppState]);

  return (
    <div className="header-container">
      {localState.isMenuToggled && (
        <div
          className="m-menu-popup"
          style={{ gridTemplateRows: `repeat(${accessLevel > 0 ? 5 : 4}, max-content) 1fr` }}>
          <div onClick={toggleMenu}>
            <HashLink className="mobile-link" to="/#home">
              Home
            </HashLink>
          </div>

          <div onClick={toggleMenu}>
            <HashLink className="mobile-link" to="/#about">
              About us
            </HashLink>
          </div>

          <div onClick={toggleMenu}>
            <HashLink className="mobile-link" to="/#stages">
              Stages
            </HashLink>
          </div>

          <div onClick={toggleMenu}>
            <HashLink className="mobile-link" to="/#test">
              Tests
            </HashLink>
          </div>

          {accessLevel > 0 && (
            <div onClick={toggleMenu}>
              <Link className="mobile-link" to="/admin">
                Admin
              </Link>
            </div>
          )}

          <div onClick={toggleMenu} className="header-btn m-menu-exit-btn"></div>
        </div>
      )}

      <div onClick={toggleMenu} className="m-burger-btn header-btn">
        menu button
      </div>
      <div className="m-space-div"></div>
      <Link to="/" className="header-logo"></Link>
      <div
        className="header-nav"
        style={{ gridTemplateColumns: `repeat(${accessLevel > 0 ? 5 : 4}, max-content)` }}>
        <div
        //  className="nav-button-clicked-2"
        >
          <HashLink
            to={'/#home'}
            className="nav-link"
            // nav-button-clicked-1
          >
            Home
          </HashLink>
        </div>
        <HashLink className="nav-link" to="/#about">
          About us
        </HashLink>
        <HashLink className="nav-link" to="/#stages">
          Stages
        </HashLink>

        <HashLink className="nav-link" to="/#test">
          Tests
        </HashLink>

        {accessLevel > 0 && (
          <Link className="nav-link" to="/admin">
            Admin
          </Link>
        )}
      </div>
      {<AuthButtons authPageToggler={authPageToggler} />}

      {appLocalState.isAuthToggled && <AuthPage showHideAuthPage={authPageToggler} />}
    </div>
  );
}

export default Header;
