import React, { useCallback, useEffect, useRef, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/admin.css';
import { AdminSelectedUser } from '../components';
import AdminMain from '../components/Admin/AdminMain';

function AdminPage() {
  const [bodyColumns, setBodyColumns] = useState(1),
    [sidebarPage, setSidebarPage] = useState(2),
    [selectedUser, setSelectedUser] = useState(null);

  const infoBody = useRef();

  const globalUser = useSelector(({ user }) => user, shallowEqual);

  const navigate = useNavigate();

  const onSidebarPageClick = useCallback((e) => {
    if (['patients-wrapper', 'patients-title', 'patients-icon'].includes(e.target.id))
      setSidebarPage(0);
    else if (
      ['subordinates-wrapper', 'subordinates-title', 'subordinates-icon'].includes(e.target.id)
    )
      setSidebarPage(1);
    else if (['calculator-wrapper', 'calculator-title', 'calculator-icon'].includes(e.target.id))
      setSidebarPage(2);
    else if (['users-wrapper', 'users-title', 'users-icon'].includes(e.target.id))
      setSidebarPage(3);
    else if ('file-input' === e.target.id) setSidebarPage(4);
  }, []);

  const onUserClick = useCallback(
    (user) => {
      setSelectedUser(user);
    },
    [setSelectedUser],
  );

  useEffect(() => {
    if (infoBody.current) {
      setBodyColumns(Math.floor(infoBody.current.offsetWidth / 350));
    }
  }, []);

  useEffect(() => {
    const onWindowResize = () => {
      if (infoBody.current) {
        setBodyColumns(Math.floor(infoBody.current.offsetWidth / 350));
      }
    };

    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  useEffect(() => {
    if (globalUser === null) navigate('/');
    else if (globalUser.accessLevel <= 0) navigate('/');

    return () => {
      if (globalUser === null) navigate('/');
      else if (globalUser.accessLevel <= 0) navigate('/');
    };
  });

  if (globalUser === null) return null;
  else if (globalUser.accessLevel <= 0) return null;

  if (selectedUser !== null)
    return <AdminSelectedUser setSelectedUser={setSelectedUser} selectedUser={selectedUser} />;

  return (
    <AdminMain
      onUserClick={onUserClick}
      sidebarPage={sidebarPage}
      onSidebarPageClick={onSidebarPageClick}
      accessLevel={globalUser.accessLevel}
    />
  );
}

export default AdminPage;
