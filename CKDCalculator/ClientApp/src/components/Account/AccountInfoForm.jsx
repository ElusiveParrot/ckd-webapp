import React, { useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import '../../assets/styles/account.css';

import { SelectInput, SubmitButton, TextInput } from '../';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../redux/actions';

function AccountInfoForm({
  isHidden = undefined,
  setHidden = undefined,
  user,
  onCloseUser = undefined,
}) {
  const [errors, setErrors] = useState([]),
    [isEditing, setEditing] = useState(false),
    [supervisors, setSupervisors] = useState([]);

  const dispatch = useDispatch();

  const globalAccessLevel = useSelector(({ user }) => user.accessLevel, shallowEqual);

  const globalUserID = useSelector(({ user }) => user.id, shallowEqual);

  const access2Text = (lvl) => {
    if (lvl === 0) return 'Patient';
    if (lvl === 1) return 'Clinician';
    if (lvl === 2) return 'Manager';
    if (lvl === 3) return 'Sysadmin';
    return null;
  };

  const text2Access = (lvl) => {
    if (lvl === 'Patient') return 0;
    if (lvl === 'Clinician') return 1;
    if (lvl === 'Manager') return 2;
    if (lvl === 'Sysadmin') return 3;
    return null;
  };

  const showSidebar = useCallback(() => {
    if (isHidden) setHidden(false);
  }, [isHidden, setHidden]);

  const hideSidebar = useCallback(() => {
    if (!isHidden) setHidden(true);
  }, [isHidden, setHidden]);

  const emailRef = useRef(user.email),
    nhsRef = useRef(user.accessLevel !== 0 ? user.professionalID.toString() : user.nhs.toString()),
    fNameRef = useRef(user.fName),
    sNameRef = useRef(user.sName),
    dobRef = useRef(user.dob.toLocaleDateString('en-UK')),
    genderRef = useRef(user.gender === 0 ? 'Male' : 'Female'),
    ethnicityRef = useRef(user.isBlack ? 'African American/black' : ''),
    accessRef = useRef(access2Text(user.accessLevel)),
    supervisorRef = useRef(
      user.supervisor === null ? '' : user.supervisor.Name + ' ' + user.supervisor.Surname,
    );

  const onCancelClick = useCallback(() => {
    emailRef.current = user.email;
    nhsRef.current = user.accessLevel !== 0 ? user.professionalID.toString() : user.nhs.toString();
    fNameRef.current = user.fName;
    sNameRef.current = user.sName;
    dobRef.current = user.dob.toLocaleDateString('en-UK');
    genderRef.current = user.gender === 0 ? 'Male' : 'Female';
    ethnicityRef.current = user.isBlack ? 'African American/black' : '';
    accessRef.current = access2Text(user.accessLevel);

    setErrors([]);
    setEditing(false);
  }, []);

  const onEditClick = useCallback(() => {
    if (!isEditing) {
      setEditing(true);
      return null;
    }

    let emailVal = emailRef.current.trim();
    let fNameVal = fNameRef.current.trim();
    let sNameVal = sNameRef.current.trim();
    let dobVal = dobRef.current.trim();
    let genderVal = genderRef.current.trim();

    let nhsNumber = nhsRef.current.trim();
    let ethnicityVal = ethnicityRef.current.trim();
    let accessLevelVal = text2Access(accessRef.current.trim());
    let supervisorIDVal = supervisorRef.current.trim();

    let localErrors = [];

    if (emailVal === '') localErrors.push({ msg: 'email input is empty', type: 'email' });
    if (fNameVal === '') localErrors.push({ msg: 'first name input is empty', type: 'fname' });
    if (sNameVal === '') localErrors.push({ msg: 'surname input is empty', type: 'sname' });
    if (dobVal === '') localErrors.push({ msg: 'birth date input is empty', type: 'dob' });
    if (nhsNumber === '') localErrors.push({ msg: 'nhs number input is empty', type: 'nhs' });
    if (genderVal === '') localErrors.push({ msg: 'gender input is empty', type: 'gender' });
    if (accessLevelVal === '') localErrors.push({ msg: 'access input is empty', type: 'access' });

    let tempDate = dobVal.split('/');

    if (
      new Date(`${tempDate[1]}/${tempDate[0]}/${tempDate[2]}`).toDateString() === 'Invalid Date'
    ) {
      localErrors.push({ msg: 'invalid date, try dd/mm/yyyy', type: 'dob' });
    }

    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (!emailVal.match(validRegex))
      localErrors.push({ msg: 'invalid email format', type: 'email' });

    if (nhsNumber.length > 10)
      localErrors.push({ msg: 'nhs number is too long, max 10', type: 'nhs' });

    if (['Male', 'Female'].indexOf(genderRef.current.trim()) === -1) {
      localErrors.push({ msg: 'invalid gender, choose from list', type: 'gender' });
    }

    if (
      ['Asian', 'African American/black', 'White', ''].indexOf(ethnicityRef.current.trim()) === -1
    ) {
      localErrors.push({ msg: 'invalid ethnicity, choose from list', type: 'ethnicity' });
    }

    if (['Patient', 'Clinician', 'Manager', 'Sysadmin'].indexOf(accessRef.current.trim()) === -1) {
      localErrors.push({ msg: 'invalid access level, choose from list', type: 'access' });
    }

    if (localErrors.length > 0) {
      setErrors([...localErrors]);
      return;
    }

    let newUser = {
      Email: emailVal,
      Name: fNameVal,
      Surname: sNameVal,
      DoB: new Date(`${tempDate[1]}/${tempDate[0]}/${tempDate[2]}`),
      Gender: genderVal === 'Male' ? 0 : 1,
      AccessLevel: accessLevelVal,
    };

    if (ethnicityVal !== '') newUser.IsBlack = ethnicityVal === 'African American/black';

    if (user.accessLevel !== 0) {
      newUser.ProfessionalId = nhsNumber;
    } else {
      newUser.NhsNumber = nhsNumber;
    }

    fetch('/api/admin/edit', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        NewDetails: newUser,
        Email: user.email,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.status === 'failure') {
          localErrors = data.errors.map((error) => {
            let errorType = error.Type === 'professionalId' ? 'nhs' : error.Type;
            return { msg: error.Data, type: errorType };
          });
          setErrors([...localErrors]);
        }

        let newMasterId = null;
        if (user.accessLevel < 2)
          newMasterId = supervisors.find(
            (supervisor) => supervisor.fullname === supervisorIDVal,
          ).ID;

        let tempUser = {
          id: data.changedUser.Id,
          dob: new Date(data.changedUser.DoB),
          gender: data.changedUser.Gender,
          accessLevel: data.changedUser.Access,
          isBlack: data.changedUser.IsBlack,
          email: data.changedUser.Email,
          fName: data.changedUser.Name,
          sName: data.changedUser.Surname,
          nhs: data.changedUser.NhsNumber,
          professionalID: data.changedUser.ProfessionalId,
        };

        if (user.accessLevel !== tempUser.accessLevel) {
          if ((tempUser.accessLevel === 0) | (tempUser.accessLevel === 1)) {
            let api = tempUser.accessLevel === 0 ? '/api/admin/clinicians' : '/api/admin/managers';

            fetch(api, {
              method: 'get',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            })
              .then((result) => result.json())
              .then((data) => {
                if (data.status === 'success')
                  setSupervisors(
                    data.users.map((user) => {
                      return {
                        ID: user.ProfessionalId,
                        fullname: user.Name + ' ' + user.Surname,
                      };
                    }),
                  );
              });
          } else setSupervisors([]);
        }

        user = { ...tempUser };

        let supervisorBody = {
          Slave: {},
          Master: {
            ProfessionalId: newMasterId,
          },
        };

        if (user.accessLevel === 0) supervisorBody.Slave.NhsNumber = user.nhs;
        else supervisorBody.Slave.ProfessionalId = user.professionalID;

        if (newMasterId !== null)
          fetch('/api/admin/assign_supervisor', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(supervisorBody),
          })
            .then((res) => res.json())
            .then((data) => {})
            .finally(() => {
              if (globalUserID === user.id) dispatch(setUser(user));
              setEditing(false);
            });
        else if (globalUserID === user.id) dispatch(setUser(user));
      })
      .catch(() => {
        localErrors.push({ msg: 'something went wrong', type: undefined });
      });
    setEditing(false);
  }, [isEditing, user]);

  useEffect(() => {
    if ((user.accessLevel === 0) | (user.accessLevel === 1)) {
      let api = user.accessLevel === 0 ? '/api/admin/clinicians' : '/api/admin/managers';

      fetch(api, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then((result) => result.json())
        .then((data) => {
          if (data.status === 'success')
            setSupervisors(
              data.users.map((user) => {
                return {
                  ID: user.ProfessionalId,
                  fullname: user.Name + ' ' + user.Surname,
                };
              }),
            );
        });
    }
  }, [user.accessLevel]);

  let errorTypes = {};
  errors.map((error) => {
    if (errorTypes[error.type] === undefined) errorTypes[error.type] = error.msg;
  });

  return (
    <div
      className={classNames('account-sidebar', { 'account-sidebar-hidden': isHidden })}
      onClick={showSidebar}>
      <div className="account-close" onClick={onCloseUser ? onCloseUser : hideSidebar}></div>
      <div className="account-icon"></div>
      {!isHidden && [
        <div key={`account-email-field`} className="form-row form-row-rs">
          <TextInput
            label={'Email'}
            valueRef={emailRef}
            id={'email'}
            required={isEditing}
            placeholder={'enter email'}
            errorTypes={errorTypes}
            defaultValue={emailRef.current}
            prefilled={!isEditing}
          />
        </div>,

        <div key={`account-fName-sName-field`} className="form-row-2-col form-row-rs">
          <TextInput
            label={'First Name'}
            valueRef={fNameRef}
            required={isEditing}
            id={'fname'}
            placeholder={'enter first name'}
            errorTypes={errorTypes}
            defaultValue={fNameRef.current}
            prefilled={!isEditing}
          />

          <TextInput
            label={'Surnane'}
            valueRef={sNameRef}
            required={isEditing}
            id={'sname'}
            placeholder={'enter second name'}
            errorTypes={errorTypes}
            defaultValue={sNameRef.current}
            prefilled={!isEditing}
          />
        </div>,

        <div key={`account-gender-dob-field`} className="form-row-2-col form-row-rs">
          <TextInput
            label={'Date of Birth'}
            valueRef={dobRef}
            id={'dob'}
            required={isEditing}
            placeholder={'enter date of birth'}
            errorTypes={errorTypes}
            defaultValue={dobRef.current}
            prefilled={!isEditing}
          />

          {isEditing ? (
            <SelectInput
              required={isEditing}
              id={'gender'}
              label={'Gender'}
              valueRef={genderRef}
              placeholder={'choose gender'}
              values={['Male', 'Female']}
              errorTypes={errorTypes}
            />
          ) : (
            <TextInput
              label={'Gender'}
              valueRef={genderRef}
              id={'gender'}
              required={isEditing}
              placeholder={'enter gender'}
              errorTypes={errorTypes}
              defaultValue={genderRef.current}
              prefilled={true}
            />
          )}
        </div>,
      ]}

      {isEditing &&
        !isHidden && [
          globalAccessLevel > 0 ? (
            <div key={`account-ethn-access-field`} className="form-row-2-col form-row-rs">
              {globalAccessLevel === 3 && (
                <SelectInput
                  required={isEditing}
                  id={'access'}
                  label={'Access Level'}
                  valueRef={accessRef}
                  placeholder={'choose access level'}
                  values={['Patient', 'Clinician', 'Manager', 'Sysadmin']}
                  errorTypes={errorTypes}
                />
              )}

              <SelectInput
                required={isEditing}
                id={'ethnicity'}
                label={'Ethnicity'}
                valueRef={ethnicityRef}
                placeholder={'choose ethnicity'}
                values={['Asian', 'African American/black', 'White']}
                errorTypes={errorTypes}
              />
            </div>
          ) : null,

          globalAccessLevel === 3 ? (
            <div key={`account-nhs-field`} className="form-row form-row-rs">
              <TextInput
                label={user.accessLevel !== 0 ? 'Professional ID' : 'NHS Number'}
                valueRef={nhsRef}
                id={'nhs'}
                required={isEditing}
                placeholder={user.accessLevel !== 0 ? 'enter professional id' : 'enter nhs number'}
                errorTypes={errorTypes}
                defaultValue={nhsRef.current}
                prefilled={!isEditing}
              />
            </div>
          ) : null,

          globalAccessLevel === 3 ? (
            <div key={`account-supervisor-field`} className="form-row form-row-rs">
              <SelectInput
                required={isEditing}
                id={'supervisor'}
                label={'Supervisor'}
                valueRef={supervisorRef}
                placeholder={'choose supervisor'}
                values={supervisors.map((supervisor) => {
                  if (user.professionalID !== supervisor.ID) return supervisor.fullname;
                  else return null;
                })}
                errorTypes={errorTypes}
              />
            </div>
          ) : null,
        ]}

      {!isHidden && (
        <div key={`account-submit-button`} className="form-row form-row-rs">
          <SubmitButton
            callback={onEditClick}
            label={isEditing ? 'SAVE PROFILE' : 'EDIT PROFILE'}
          />
        </div>
      )}

      {isEditing && !isHidden && (
        <div key={`account-cancel-button`} className="form-row form-row-rs">
          <SubmitButton
            callback={onCancelClick}
            label={'CANCEL'}
            marginTop={'-20px'}
            gradientValues={['#0d0d0d', '#262626']}
          />
        </div>
      )}
    </div>
  );
}

export default AccountInfoForm;
