import React, { useCallback, useEffect, useState } from 'react';
// import '../assets/styles/account.css';
import { AccountInfoForm, HomeTestForm, UserMeasurements } from '../../components';
function AdminSelectedUser({ selectedUser, setSelectedUser }) {
  const [userMeasurements, setUserMeasurements] = useState([]);

  const getUserMeasurements = async (id) => {
    await fetch('/api/admin/patients_measurements?Email=' + id, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.status === 'success') setUserMeasurements([...data.measurements]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getUserMeasurements(selectedUser.email);
  }, []);

  const onCloseUser = useCallback(() => {
    setSelectedUser(null);
  });

  return (
    <div className="account-main-container">
      <AccountInfoForm user={selectedUser} onCloseUser={onCloseUser} />
      <div>
        <HomeTestForm selectedUser={selectedUser} />
        <UserMeasurements measures={userMeasurements} />
      </div>
    </div>
  );
}

export default AdminSelectedUser;
