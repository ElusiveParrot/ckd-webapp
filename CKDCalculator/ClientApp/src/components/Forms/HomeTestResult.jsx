import React, { useCallback } from 'react';
import './../../assets/styles/home-form.css';
import SubmitButton from './SubmitButton';
import TextInput from './TextInput';

function HomeTestResult({ result = {}, setTestReceived, setAppState, appState }) {
  const retakeTest = useCallback(() => {
    setTestReceived(undefined);
  }, []);

  const onRegister = useCallback(() => {
    setAppState({ ...appState, isAuthToggled: true });
  }, [setAppState]);

  return (
    <div className="main-form-container main-form-container-rs">
      <div className="form-title form-title-rs">Test Result</div>
      <div className="form-body form-body-rs">
        <div className="form-row-2-col form-row-rs">
          <TextInput
            result
            id={'stage-input'}
            label={'CKD Stage'}
            placeholder={'CKD Stage'}
            defaultValue={result.stage}
          />

          <TextInput
            result
            id={'efgr-input'}
            label={'EFGR'}
            placeholder={'EFGR'}
            defaultValue={result.result}
          />
        </div>

        <div className="form-row-2-col">
          <TextInput
            id={'f-name-input'}
            result
            placeholder={'enter first name'}
            label={'First Name'}
            defaultValue={result.fName}
          />

          <TextInput
            result
            id={'s-name-input'}
            placeholder={'enter second name'}
            label={'Second Name'}
            defaultValue={result.sName}
          />
        </div>

        <div className="form-row-2-col">
          <TextInput
            id={'nhs-input'}
            result
            placeholder={'enter nhs number'}
            label={'NHS Number'}
            defaultValue={result.nhs}
          />

          <TextInput
            result
            id={'age-input'}
            placeholder={'enter date of birth'}
            label={'Date of Birth'}
            type={'number'}
            defaultValue={result.dob}
          />
        </div>

        <div className="form-row-2-col">
          <TextInput
            defaultValue={result.gender}
            result
            id={'gender-select'}
            placeholder={'choose gender'}
            label={'Gender'}
          />

          <TextInput
            label={'Email'}
            id={'email-input'}
            result
            placeholder={'enter email'}
            defaultValue={result.email}
          />
        </div>

        {result.from === 'email' ? (
          <div className="form-row">
            <SubmitButton label={'REGISTER'} callback={onRegister} />
          </div>
        ) : (
          <div className="form-row">
            <SubmitButton label={'RETAKE'} callback={retakeTest} />
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeTestResult;
