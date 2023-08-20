import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SearchInput from '../Forms/SearchInput';

function AdminUserList({ type, onUserClick, search }) {
  const searchRef = useRef('');
  const [searchParam, setSearchParam] = useState('');
  const [pageNumber, setPageNumber] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  const getSubordinates = async (searchParam) => {
    if (!search) {
      await fetch('/api/admin/subordinates', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
          if (data.status === 'success') {
            let tempUsers = data.subordinates.map((user) => {
              return {
                id: user.Id,
                dob: new Date(user.DoB),
                gender: user.Gender,
                accessLevel: user.Access,
                isBlack: user.IsBlack,
                email: user.Email,
                fName: user.Name,
                sName: user.Surname,
                nhs: user.NhsNumber,
                supervisor: user.Supervisor,
                professionalID: user.ProfessionalId,
              };
            });
            setUserList(tempUsers);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      let fullName = searchParam.split(' ');
      let fName = fullName[0];
      let sName = fullName[1] === undefined ? '' : `&Surname=${fullName[1]}`;

      await fetch(
        `/api/admin/search?FirstName=${fName}${sName}&OffsetStart=${pageNumber * 25}&OffsetEnd=${
          pageNumber * 25 + 25
        }`,
        {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          let tempUsers = data.foundUsers.map((user) => {
            return {
              id: user.Id,
              dob: new Date(user.DoB),
              gender: user.Gender,
              accessLevel: user.Access,
              isBlack: user.IsBlack,
              email: user.Email,
              fName: user.Name,
              sName: user.Surname,
              nhs: user.NhsNumber,
              supervisor: user.Supervisor,
              supervisorID: user.SupervisorId,
              professionalID: user.ProfessionalId,
            };
          });

          setTotalUsers(data.totalUsersFound);
          setUserList(tempUsers);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const access2Text = (lvl) => {
    if (lvl === 0) return 'Patient';
    if (lvl === 1) return 'Clinician';
    if (lvl === 2) return 'Manager';
    if (lvl === 3) return 'Sysadmin';
    return null;
  };

  const [userList, setUserList] = React.useState(null);

  useEffect(() => {
    getSubordinates(searchParam);
  }, [searchParam, pageNumber]);

  const onUserSeach = useCallback((e) => {
    e.preventDefault();
    setSearchParam(searchRef.current.trim());
  }, []);

  const onPageClick = useCallback(
    (e) => {
      if (pageNumber !== e.target.innerHTML) setPageNumber(parseInt(e.target.innerHTML) - 1);
    },
    [pageNumber],
  );

  let pageCount = totalUsers < 25 ? 1 : Math.floor(totalUsers / 25);

  if (userList === null) return null;

  return (
    <div className="admin-content-area">
      <div className="admin-content-container">
        <div className="admin-content-title-area">
          <div className={'admin-content-title'}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>

          {type === 'All Users' && (
            <SearchInput
              label={'Search'}
              id={'search'}
              placeholder={'search...'}
              valueRef={searchRef}
              callback={onUserSeach}
            />
          )}
        </div>

        <div
          className="admin-content-body"
          style={{
            gridTemplateColumns: `repeat(${type === 'All Users' ? '1' : '2'}, max-content)`,
          }}>
          {userList.map((u) => {
            return (
              <div
                className="table-row"
                onClick={() => {
                  onUserClick({ ...u });
                }}
                key={`user-${u.id}`}>
                <div className="talbe-column">
                  <div className="table-label">Full Name</div>
                  <div className={'table-value'}>{`${u.fName} ${u.sName}`}</div>
                </div>
                <div className="table-column">
                  <div className="table-label">Date of Birth</div>
                  <div className={'table-value'}>{u.dob.toLocaleDateString('en-UK')}</div>
                </div>
                <div className="table-column">
                  <div className="table-label">
                    {u.accessLevel !== 0 ? 'Professional ID' : 'NHS Number'}
                  </div>
                  <div className={'table-value'}>
                    {u.accessLevel !== 0 ? u.professionalID : u.nhs}
                  </div>
                </div>
                <div className="table-column">
                  <div className="table-label">Gender</div>
                  <div className={'table-value'}>{u.gender === 0 ? 'Male' : 'Female'}</div>
                </div>

                <div className="table-column">
                  <div className="table-label">Role</div>
                  <div className={'table-value'}>{access2Text(u.accessLevel)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {type === 'All Users' && totalUsers > 0 && (
        <div className="admin-pagination">
          <div className="admin-page-up"></div>
          {[...Array(pageCount)].map((e, i) => {
            return (
              <div
                onClick={onPageClick}
                key={`page-number-${i}`}
                className={classNames('admin-page-number', {
                  'admin-page-clicked': i === pageNumber,
                })}>
                {i + 1}
              </div>
            );
          })}

          <div className="admin-page-down"></div>
        </div>
      )}
    </div>
  );
}

export default AdminUserList;
