import React, { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

import { Footer, Header } from './components';
import { AccountPage, AdminPage, MainPage } from './pages';
import { setMeasurements, setUser } from './redux/actions';

function App() {
  const [localState, setLocalState] = useState({
    forecasts: [],
    isLoading: true,
    isAuthToggled: false,
  });

  const dispatch = useDispatch();

  const globalState = useSelector(({ user }) => {
    return { user: user };
  }, shallowEqual);

  useEffect(() => {
    if (localState.isLoading)
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

          dispatch(setUser(tempUser));

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
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLocalState({ ...localState, isLoading: false });
        });
  }, [localState, globalState.user]);

  if (localState.isLoading) return null;

  return (
    <div className="main-container">
      <BrowserRouter>
        <Header appLocalState={localState} setAppState={setLocalState} />

        <Routes>
          <Route
            element={<MainPage appState={localState} setAppState={setLocalState} />}
            path="/"></Route>
          <Route element={<AccountPage />} path="/account"></Route>
          <Route element={<AdminPage />} path="/admin"></Route>
        </Routes>

        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
