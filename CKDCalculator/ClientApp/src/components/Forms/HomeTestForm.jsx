import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMeasurement } from '../../redux/actions';
import './../../assets/styles/home-form.css';
import HomeTestResult from './HomeTestResult';
import SelectInput from './SelectInput';
import SubmitButton from './SubmitButton';
import TextInput from './TextInput';

function HomeTestForm({
  admin = false,
  setAppState = undefined,
  appState = false,
  selectedUser = null,
}) {
  const dispatch = useDispatch();
  const [testReceived, setTestReceived] = useState();
  const gender2Text = useCallback((gender) => (gender === 0 ? 'Male' : 'Female'));

  const urlParams = new URLSearchParams(window.location.search);

  const getStage = (rs) => {
    if (rs >= 90) return 1;

    if (rs >= 60) return 2;

    if (rs >= 45) return 3;

    if (rs >= 30) return 4;

    if (rs >= 15) return 5;

    return 6;
  };

  if (urlParams.get('From') === 'email') {
    let result = {
      email: urlParams.get('Email'),
      fName: urlParams.get('Name') === null ? 'Empty' : urlParams.get('Name'),
      sName: urlParams.get('Surname') === null ? 'Empty' : urlParams.get('Surname'),
      nhs: urlParams.get('NhsNumber') === null ? 'Empty' : urlParams.get('NhsNumber'),
      dob:
        urlParams.get('DoB') === null
          ? 'Empty'
          : new Date(urlParams.get('DoB')).toLocaleDateString('en-UK'),
      gender: urlParams.get('Gender') === null ? 'Empty' : urlParams.get('Gender'),
      stage: urlParams.get('Result') === null ? 'Empty' : getStage(urlParams.get('Result')),
      result:
        urlParams.get('Result') === null
          ? 'Empty'
          : parseInt(urlParams.get('Result')).toFixed(2) + ' mL/min/1.73m2',
      from: 'email',
    };

    if (testReceived === undefined) setTestReceived(result);
  }

  const emailRef = useRef(undefined),
    fNameRef = useRef(undefined),
    sNameRef = useRef(undefined),
    nhsRef = useRef(undefined),
    genderRef = useRef(undefined),
    creatinineRef = useRef(''),
    measureUnitRef = useRef(''),
    ethnicityRef = useRef(''),
    dobRef = useRef(undefined);

  const globalState = useSelector(
    ({ user }) => {
      if (selectedUser !== null) return { user: selectedUser };
      if (admin) return { user: null };
      if (user === null) return { user: null };
      if (user.accessLevel === 1) return { user: null };
      return { user: user };
    },
    (a, b) => {
      if (a.user !== b.user) {
        if (b.user === null) {
          emailRef.current = '';
          fNameRef.current = '';
          sNameRef.current = '';
          nhsRef.current = '';
          genderRef.current = '';
          dobRef.current = '';
        }
      }

      if (b.user !== null) {
        emailRef.current = b.user.email;
        fNameRef.current = b.user.fName;
        sNameRef.current = b.user.sName;
        nhsRef.current =
          b.user.accessLevel !== 0 ? b.user.professionalID.toString() : b.user.nhs.toString();
        genderRef.current = gender2Text(b.user.gender);
        dobRef.current = new Date(b.user.dob).toLocaleDateString('en-UK');
      }

      return a.user === b.user;
    },
  );

  if (emailRef.current === undefined) {
    if (globalState.user === null) {
      emailRef.current = '';
      fNameRef.current = '';
      sNameRef.current = '';
      nhsRef.current = '';
      genderRef.current = '';
      dobRef.current = '';
    } else {
      emailRef.current = globalState.user.email;
      fNameRef.current = globalState.user.fName;
      sNameRef.current = globalState.user.sName;
      nhsRef.current =
        globalState.user.accessLevel !== 0
          ? globalState.user.professionalID.toString()
          : globalState.user.nhs.toString();
      genderRef.current = gender2Text(globalState.user.gender);
      dobRef.current = new Date(globalState.user.dob).toLocaleDateString('en-UK');
    }
  }

  const [localState, setLocalState] = useState({
    errors: [],
  });

  const onSubmitTest = (e) => {
    e.preventDefault();

    let localErrors = [];

    if (emailRef.current.trim() === '' && !admin)
      localErrors.push({ msg: 'email is empty', type: 'email' });
    if (ethnicityRef.current.trim() === '')
      localErrors.push({ msg: 'ethnicity is empty', type: 'ethn' });
    if (dobRef.current.trim() === '')
      localErrors.push({ msg: 'date of birth is empty', type: 'dob' });
    if (genderRef.current.trim() === '')
      localErrors.push({ msg: 'gender is empty', type: 'gender' });
    if (measureUnitRef.current.trim() === '')
      localErrors.push({ msg: 'creatinine measure unit is empty', type: 'measure' });
    if (creatinineRef.current.trim() === '')
      localErrors.push({ msg: 'creatinine is empty', type: 'creatinine' });

    if (nhsRef.current.trim().length > 10)
      localErrors.push({
        msg: 'nhs number is too long, exactly 10 characters required',
        type: 'nhs',
      });

    if ((nhsRef.current.trim().length < 10) & (nhsRef.current.trim().length !== 0))
      localErrors.push({
        msg: 'nhs number is too short, exactly 10 characters required',
        type: 'nhs',
      });

    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (!emailRef.current.trim().match(validRegex) && !admin) {
      localErrors.push({ msg: 'invalid email format', type: 'email' });
    }

    let tempDate = dobRef.current.trim().split('/');
    if (
      new Date(`${tempDate[1]}/${tempDate[0]}/${tempDate[2]}`).toDateString() === 'Invalid Date'
    ) {
      localErrors.push({ msg: 'invalid date, try dd/mm/yyyy', type: 'dob' });
    }

    if (['Male', 'Female'].indexOf(genderRef.current.trim()) === -1) {
      localErrors.push({ msg: 'invalid gender, choose from list', type: 'gender' });
    }

    if (['umol/l', 'mg/dL'].indexOf(measureUnitRef.current.trim()) === -1) {
      localErrors.push({ msg: 'invalid unit, choose from list', type: 'measure' });
    }

    if (localErrors.length > 0) {
      setLocalState({ ...localState, errors: localErrors });
      return;
    }

    let test = {
      Creatinine: creatinineRef.current.trim(),
    };

    if (measureUnitRef.current.trim() === 'mg/dL') test.Creatinine = test.Creatinine * 88.4;

    if (selectedUser !== null) {
      test.PatientNhsNumber = nhsRef.current.trim();
    }

    if (globalState.user === null) {
      test.Email = admin && emailRef.current.trim() === '' ? null : emailRef.current.trim();
      test.Name = fNameRef.current.trim() === '' ? null : fNameRef.current.trim();
      test.Surname = sNameRef.current.trim() === '' ? null : sNameRef.current.trim();
      test.NhsNumber = nhsRef.current.trim();

      test.DoB = new Date(`${tempDate[1]}/${tempDate[0]}/${tempDate[2]}`);
      test.Gender = genderRef.current.toLowerCase().trim();
      test.IsBlack = ethnicityRef.current.trim() === 'African American/black';
    }

    let api = globalState.user === null ? '/api/guest/measure' : '/api/user/measure';

    console.log(api, test);

    fetch(api, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(test),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.status === 'failure') {
          localErrors = data.errors.map((error) => {
            return { msg: error.Data, type: error.Type.toLowerCase() };
          });

          setLocalState({ ...localState, errors: localErrors });
        }

        let result = {
          email: emailRef.current === '' ? 'Empty' : emailRef.current,
          fName: fNameRef.current === '' ? 'Empty' : fNameRef.current,
          sName: sNameRef.current === '' ? 'Empty' : sNameRef.current,
          stage: getStage(data.result ? data.result : data.newMeasurement.Result),
          nhs: nhsRef.current === '' ? 'Empty' : nhsRef.current,
          dob: dobRef.current === '' ? 'Empty' : dobRef.current,
          gender: genderRef.current === '' ? 'Empty' : genderRef.current,
          result: data.result
            ? parseFloat(data.result).toFixed(2) + ' mL/min/1.73m2'
            : parseFloat(data.newMeasurement.Result).toFixed(2) + ' mL/min/1.73m2',
        };

        if (globalState.user !== null) {
          let tempMeasurement = { ...data.newMeasurement };
          delete tempMeasurement.User;

          dispatch(addMeasurement(tempMeasurement));
        } else {
          emailRef.current = undefined;
          fNameRef.current = undefined;
          sNameRef.current = undefined;
          nhsRef.current = undefined;
          genderRef.current = undefined;
          dobRef.current = undefined;
          ethnicityRef.current = '';
          measureUnitRef.current = '';
          creatinineRef.current = '';
        }

        setTestReceived(result);
      })
      .catch(() => {
        localErrors.push({ msg: 'something went wrong', type: undefined });
      });
  };

  useEffect(() => {
    return () => {
      localState.errors = [];
    };
  });

  let errorTypes = {};
  localState.errors.map((error) => {
    if (errorTypes[error.type] === undefined) errorTypes[error.type] = error.msg;
  });

  return (
    <div id="test" className="home-test-form-bg">
      {testReceived !== undefined ? (
        <HomeTestResult
          result={testReceived}
          setTestReceived={setTestReceived}
          setAppState={setAppState}
          appState={appState}
        />
      ) : (
        <form className="main-form-container">
          <div className="form-title">EFGR Test</div>
          <div className="form-body">
            <div className="form-row">
              <TextInput
                valueRef={emailRef}
                label={'Email'}
                id={'email'}
                required={!admin}
                placeholder={'enter email'}
                errorTypes={errorTypes}
                defaultValue={emailRef.current}
                prefilled={globalState.user !== null}
              />
            </div>

            <div className="form-row-2-col">
              <TextInput
                valueRef={fNameRef}
                id={'fname'}
                placeholder={'enter first name'}
                defaultValue={fNameRef.current}
                label={'First Name'}
                errorTypes={errorTypes}
                prefilled={globalState.user !== null}
              />

              <TextInput
                valueRef={sNameRef}
                id={'sname'}
                placeholder={'enter second name'}
                label={'Surname'}
                errorTypes={errorTypes}
                prefilled={globalState.user !== null}
                defaultValue={sNameRef.current}
              />
            </div>

            <div className="form-row-2-col">
              <SelectInput
                required
                id={'ethn'}
                label={'Ethnicity'}
                valueRef={ethnicityRef}
                placeholder={'choose ethnicity'}
                values={['Asian', 'African American/black', 'White']}
                errorTypes={errorTypes}
              />

              <TextInput
                valueRef={dobRef}
                id={'dob'}
                placeholder={'enter date of birth'}
                label={'Date of Birth (dd/mm/yyyy)'}
                required
                errorTypes={errorTypes}
                prefilled={globalState.user !== null}
                defaultValue={dobRef.current}
              />
            </div>

            <div className="form-row-2-col">
              <TextInput
                valueRef={nhsRef}
                id={'nhs'}
                placeholder={'enter nhs number'}
                label={'NHS Number'}
                errorTypes={errorTypes}
                prefilled={globalState.user !== null}
                defaultValue={nhsRef.current}
              />

              <SelectInput
                required
                id={'gender'}
                label={'Gender'}
                valueRef={genderRef}
                placeholder={'choose gender'}
                values={['Male', 'Female']}
                errorTypes={errorTypes}
                prefilled={globalState.user !== null}
              />
            </div>

            <div className="form-row-2-col">
              <SelectInput
                required
                id={'measure'}
                valueRef={measureUnitRef}
                label={'Creatinine Measurement Unit'}
                placeholder={'choose measurement unit'}
                values={['umol/l', 'mg/dL']}
                errorTypes={errorTypes}
              />
              <TextInput
                required
                id={'creatinine'}
                valueRef={creatinineRef}
                placeholder={'enter creatinine level'}
                label={'Creatinine'}
                errorTypes={errorTypes}
              />
            </div>

            <div className="form-row">
              <SubmitButton label={'SUBMIT'} callback={onSubmitTest} />
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default HomeTestForm;
