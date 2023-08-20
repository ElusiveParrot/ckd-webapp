import React, { useRef, useCallback, useState, useEffect } from 'react';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { setMeasurements, setUser } from '../../redux/actions/';
import SubmitButton from '../Forms/SubmitButton';

function Login({ authPageToggler, showHideAuthPage }) {
  const emailInput = useRef(),
    pswdInput = useRef(),
    rememberInput = useRef(),
    dispatch = useDispatch();

  const [localState, setLocalState] = useState({
    errors: [],
  });

  const onLoginSubmit = useCallback(
    (e) => {
      e.preventDefault();

      let emailVal = emailInput.current.value.trim();
      let pswdVal = pswdInput.current.value.trim();
      let rememberVal = rememberInput.current.value === 'on';

      let localErrors = [];

      if (emailVal === '') localErrors.push({ msg: 'email input is empty', type: 'email' });
      if (pswdVal === '') localErrors.push({ msg: 'password input is empty', type: 'pswd' });

      if (localErrors.length > 0) {
        setLocalState({ ...localState, errors: localErrors });
        return;
      }

      fetch('/api/login', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ Email: emailVal, Password: pswdVal, RememberMe: rememberVal }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.status === 'failure') {
            localErrors = data.errors.map((error) => {
              return { msg: error.Data, type: error.Type };
            });

            setLocalState({ ...localState, errors: localErrors });
            return null;
          }

          showHideAuthPage();
          fetch('/api/user/info', {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          })
            .then((response) => {
              return response.json();
            })
            .then((data) => {
              if (data.status !== 'success') return null;

              let tempUser = {
                id: data.user.Id,
                dob: new Date(data.user.DoB),
                gender: data.user.Gender,
                accessLevel: data.user.Access,
                isBlack: data.user.IsBlack,
                email: data.user.Email,
                fName: data.user.Name,
                sName: data.user.Surname,
                nhs: data.user.NhsNumber,
                supervisor: data.user.Supervisor,
                supervisorID: data.user.SupervisorId,
                professionalID: data.user.ProfessionalId,
              };

              fetch('/api/user/measurements', {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.status === 'success') {
                    dispatch(
                      setMeasurements(
                        data.measurements.map((m) => {
                          delete m.User;
                          return m;
                        }),
                      ),
                    );
                  }
                });

              dispatch(setUser(tempUser));
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch(() => {
          localErrors.push({ msg: 'something went wrong', type: undefined });
        })
        .finally(() => {});
    },
    [localState],
  );

  useEffect(() => {
    return () => {
      localState.errors = [];
    };
  });

  let errorTypes = [];
  let errorMsgs = localState.errors.map((error, index) => {
    if (errorTypes.indexOf(error.type) === -1) errorTypes.push(error.type);
    return (
      <div key={`error-msg-${index}-${error.type}`} className="auth-pg-error">
        * {error.msg}
      </div>
    );
  });

  return (
    <form className="auth-pg-container">
      <div className="auth-pg-title">Welcome back!</div>
      {errorMsgs}
      <div className="auth-pg-body">
        <div className="auth-pg-field">
          <label
            htmlFor="email-register"
            className={classNames({ 'label-error': errorTypes.includes('email') })}>
            Email/NHS No
            {errorTypes.includes('email') && '* '}
          </label>
          <input ref={emailInput} type="text" id="email-register" />
        </div>

        <div className="auth-pg-field">
          <label
            htmlFor="psw-register"
            className={classNames({ 'label-error': errorTypes.includes('pswd') })}>
            Password
            {errorTypes.includes('pswd') && '* '}
          </label>
          <input ref={pswdInput} type="password" id="psw-register" autoComplete="on" />
        </div>

        <div className="auth-pg-remember">
          <label htmlFor="remember-me">Remember me</label>
          <input
            ref={rememberInput}
            className="remember-chbx"
            type="checkbox"
            id="remember-me"
            autoComplete="on"
          />
        </div>
      </div>
      <div className="auth-pg-btns">
        <SubmitButton label={'SUBMIT'} callback={onLoginSubmit} />
        <div className="auth-btn auth-cancel-btn" onClick={showHideAuthPage}>
          Cancel
        </div>
      </div>
      <div className="register-pg-swtch">
        Are you not registered yet? <span onClick={authPageToggler}>Register</span>.
      </div>
    </form>
  );
}

export default Login;
