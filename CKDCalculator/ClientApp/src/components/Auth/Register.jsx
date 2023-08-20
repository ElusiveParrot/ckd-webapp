import classNames from 'classnames';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/actions';
import SubmitButton from '../Forms/SubmitButton';

function Register({ authPageToggler, showHideAuthPage }) {
  const dispatch = useDispatch();

  const urlParams = new URLSearchParams(window.location.search);

  const emailInput = useRef(urlParams.get('Email')),
    fNameInput = useRef(urlParams.get('Name')),
    sNameInput = useRef(urlParams.get('Surname')),
    dobInput = useRef(new Date(urlParams.get('DoB')).toLocaleDateString('en-UK')),
    nhsNumberInput = useRef(urlParams.get('NhsNumber')),
    ethnicityInput = useRef(),
    pswdInput = useRef(),
    rpswdInput = useRef(),
    genderInput = useRef(urlParams.get('Gender'));

  const [localState, setLocalState] = useState({
    errors: [],
  });

  const onRegisterSubmit = useCallback(
    (e) => {
      e.preventDefault();

      let emailVal = emailInput.current.value.trim();
      let fNameVal = fNameInput.current.value.trim();
      let sNameVal = sNameInput.current.value.trim();
      let dobVal = new Date(dobInput.current.value.trim());
      let nhsNumber = nhsNumberInput.current.value.trim();
      let ethnicityVal = ethnicityInput.current.value.trim() === 'black' ? true : false;
      let genderVal = genderInput.current.value.trim();
      let pswdVal = pswdInput.current.value.trim();
      let rpswdVal = rpswdInput.current.value.trim();

      let localErrors = [];

      if (emailVal === '') localErrors.push({ msg: 'email input is empty', type: 'email' });
      if (fNameVal === '') localErrors.push({ msg: 'first name input is empty', type: 'fname' });
      if (sNameVal === '') localErrors.push({ msg: 'surname input is empty', type: 'sname' });
      if (dobVal === '') localErrors.push({ msg: 'birth date input is empty', type: 'dob' });
      if (genderVal === '') localErrors.push({ msg: 'gender input is empty', type: 'gender' });
      if (nhsNumber === '') localErrors.push({ msg: 'nhs number input is empty', type: 'nhs' });
      if (ethnicityVal === '') localErrors.push({ msg: 'ethnicity input is empty', type: 'ethn' });
      if (pswdVal === '') localErrors.push({ msg: 'password input is empty', type: 'pswd' });
      if (rpswdVal === '')
        localErrors.push({ msg: 'repeat password input is empty', type: 'rpswd' });

      if (pswdVal !== rpswdVal)
        localErrors.push({ msg: 'repeat password does not match', type: 'rpswd' });

      if (nhsNumber.length > 10)
        localErrors.push({
          msg: 'nhs number is long short, exactly 10 characters required',
          type: 'nhs',
        });

      if ((nhsNumber.length < 10) & (nhsNumber.length !== 0))
        localErrors.push({
          msg: 'nhs number is too short, exactly 10 characters required',
          type: 'nhs',
        });

      // let tempDate = dobRef.current.trim().split('/');
      if (dobVal.toDateString() === 'Invalid Date')
        localErrors.push({ msg: 'invalid date, try dd/mm/yyyy', type: 'dob' });

      var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

      if (!emailVal.match(validRegex))
        localErrors.push({ msg: 'invalid email format', type: 'email' });

      if (localErrors.length > 0) {
        setLocalState({ ...localState, errors: localErrors });
        return;
      }

      let user = {
        NhsNumber: nhsNumber,
        Email: emailVal,
        Password: pswdVal,
        Name: fNameVal,
        Surname: sNameVal,
        Gender: genderVal,
        IsBlack: ethnicityVal,
        DoB: dobVal,
      };

      fetch('/api/register', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
          if (data.status === 'failure') {
            localErrors = data.errors.map((error) => {
              return { msg: error.Data, type: error.Type };
            });

            console.log(localErrors);
            setLocalState({ ...localState, errors: localErrors });
          }

          let tempUser = {
            id: data.createdUser.Id,
            dob: new Date(data.createdUser.DoB),
            gender: data.createdUser.Gender,
            accessLevel: data.createdUser.Access,
            isBlack: data.createdUser.IsBlack,
            email: data.createdUser.Email,
            fName: data.createdUser.Name,
            sName: data.createdUser.Surname,
            nhs: data.createdUser.NhsNumber,
            supervisor: data.createdUser.Supervisor,
            professionalID: data.createdUser.ProfessionalId,
          };

          dispatch(setUser(tempUser));
          showHideAuthPage();
        })
        .catch(() => {
          localErrors.push({ msg: 'something went wrong', type: undefined });
        });
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
    <form className="auth-pg-container register-pg-container">
      <div className="auth-pg-title">Register</div>
      {errorMsgs}
      <div className="auth-pg-body register-pg-body">
        <div className="auth-pg-field">
          <label
            htmlFor="email-register"
            className={classNames({ 'label-error': errorTypes.includes('email') })}>
            Email
            {errorTypes.includes('email') && '* '}
          </label>
          <input
            defaultValue={urlParams.get('Email') === null ? '' : urlParams.get('Email')}
            ref={emailInput}
            type="email"
            id="email-register"
          />
        </div>

        <div className="auth-pg-field">
          <label
            htmlFor="fname-register"
            className={classNames({ 'label-error': errorTypes.includes('fname') })}>
            First name
            {errorTypes.includes('fname') && '* '}
          </label>
          <input
            defaultValue={urlParams.get('Name') === null ? '' : urlParams.get('Name')}
            ref={fNameInput}
            type="text"
            id="fname-register"
          />
        </div>

        <div className="auth-pg-field">
          <label
            htmlFor="sname-register"
            className={classNames({ 'label-error': errorTypes.includes('sname') })}>
            Surname
            {errorTypes.includes('sname') && '* '}
          </label>
          <input
            defaultValue={urlParams.get('Surname') === null ? '' : urlParams.get('Surname')}
            ref={sNameInput}
            type="text"
            id="sname-register"
          />
        </div>

        <div className="auth-pg-field">
          <label
            htmlFor="date-register"
            className={classNames({ 'label-error': errorTypes.includes('dob') })}>
            Date of Birth (dd/mm/yyyy)
            {errorTypes.includes('dob') && '* '}
          </label>
          <input
            defaultValue={
              urlParams.get('DoB') === null
                ? ''
                : new Date(urlParams.get('DoB')).toLocaleDateString('en-UK')
            }
            ref={dobInput}
            type="text"
            id="date-register"
          />
        </div>

        <div className="auth-pg-field">
          <label
            htmlFor="nhs-register"
            className={classNames({ 'label-error': errorTypes.includes('gender') })}>
            Gender
            {errorTypes.includes('gender') && '* '}
          </label>
          <select
            defaultValue={
              urlParams.get('Gender') === null ? '' : urlParams.get('Gender').toLocaleLowerCase()
            }
            ref={genderInput}
            id="nhs-register"
            className="ethn-select">
            <option value={'male'}>Male</option>
            <option value={'female'}>Female</option>
          </select>
        </div>

        <div className="auth-pg-field">
          <label
            htmlFor="nhs-register"
            className={classNames({ 'label-error': errorTypes.includes('ethn') })}>
            Ethnicity
            {errorTypes.includes('ethn') && '* '}
          </label>
          <select ref={ethnicityInput} id="nhs-register" className="ethn-select">
            <option value={'white'}>White</option>
            <option value={'asian'}>Asian</option>
            <option value={'black'}>African American/black</option>
          </select>
        </div>

        <div className="auth-pg-field">
          <label
            htmlFor="nhs-register"
            className={classNames({ 'label-error': errorTypes.includes('nhs') })}>
            NHS number
            {errorTypes.includes('nhs') && '* '}
          </label>
          <input
            defaultValue={urlParams.get('NhsNumber') === null ? '' : urlParams.get('NhsNumber')}
            ref={nhsNumberInput}
            type="text"
            id="nhs-register"
          />
        </div>

        <div className="auth-pg-field">
          <label
            htmlFor="psw-register"
            className={classNames({ 'label-error': errorTypes.includes('pswd') })}>
            Password
            {errorTypes.includes('pswd') && '* '}
          </label>
          <input ref={pswdInput} type="password" id="psw-register" />
        </div>

        <div className="auth-pg-field">
          <label
            htmlFor="rpsw-register"
            className={classNames({ 'label-error': errorTypes.includes('rpswd') })}>
            Repeat password
            {errorTypes.includes('rpswd') && '* '}
          </label>
          <input ref={rpswdInput} type="password" id="rpsw-register" />
        </div>
      </div>
      <div className="auth-pg-btns">
        <SubmitButton label={'create'} callback={onRegisterSubmit} />

        <div className="auth-btn auth-cancel-btn" onClick={showHideAuthPage}>
          Cancel
        </div>
      </div>
      <div className="register-pg-swtch">
        Are you registered already? <span onClick={authPageToggler}>Log in</span>.
      </div>
    </form>
  );
}

export default Register;
