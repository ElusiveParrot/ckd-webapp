import React, { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/account.css';
import { AccountInfoForm, UserMeasurements } from '../components';
function AccountPage() {
  const [isHidden, setHidden] = useState(false);

  const globalUser = useSelector(({ user }) => user, shallowEqual);

  const navigate = useNavigate();

  const globalMeasurements = useSelector(({ measurements }) => {
    if (measurements === null) return [];
    return measurements;
  }, shallowEqual);

  useEffect(() => {
    if (globalUser === null) navigate('/');

    return () => {
      if (globalUser === null) navigate('/');
    };
  });

  if (globalUser === null) return null;
  return (
    <div className="account-main-container">
      <AccountInfoForm isHidden={isHidden} setHidden={setHidden} user={globalUser} />
      <UserMeasurements measures={globalMeasurements} />
    </div>
  );
}

export default AccountPage;
