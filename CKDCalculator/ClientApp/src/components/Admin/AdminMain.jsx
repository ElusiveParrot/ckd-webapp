import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import HomeTestForm from '../Forms/HomeTestForm';
import AdminUserList from './AdminUserList';
import readXlsxFile from 'read-excel-file';

function AdminMain({ sidebarPage, onSidebarPageClick, onUserClick, accessLevel }) {
  const getStage = (rs) => {
    if (rs >= 90) return 1;

    if (rs >= 60) return 2;

    if (rs >= 45) return 3;

    if (rs >= 30) return 4;

    if (rs >= 15) return 5;

    return 6;
  };

  const onImportClick = useCallback((e) => {
    e.preventDefault();

    console.log(e.target.files[0]);

    if (e.target.files[0] !== undefined)
      readXlsxFile(e.target.files[0]).then((data) => {
        let cols = data.splice(0, 1)[0];
        let values = data.map((row, i) => {
          let newVal = {};

          row.map((val, i) => {
            if (val !== null) newVal[cols[i]] = val;
          });

          return newVal;
        });
        let body = { Entries: values };

        fetch('/api/admin/csv_calculator', {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          method: 'POST',
          body: JSON.stringify(body),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            if (data.status === 'success') {
              values = data.results.map((result, i) => {
                return { ...values[i], result: result, stage: getStage(result) };
              });

              setCsvMeasurements(values);
            }
            console.log(values);
          })
          .catch((err) => {
            console.log(err);
          });
      });
  }, []);

  const [csvMeasurements, setCsvMeasurements] = useState([]);

  return (
    <div className="admin-main-container">
      <div className={classNames('admin-sidebar')}>
        {accessLevel === 1 && (
          <div
            onClick={onSidebarPageClick}
            id="patients-wrapper"
            className={classNames('admin-sidebar-nav-link', {
              'admin-sidebar-nav-link-clicked': sidebarPage === 0,
            })}>
            <div id="patients-icon" className="admin-my-patients"></div>
            <div id="patients-title">Patients</div>
          </div>
        )}

        {accessLevel === 2 && (
          <div
            onClick={onSidebarPageClick}
            id="subordinates-wrapper"
            className={classNames('admin-sidebar-nav-link', {
              'admin-sidebar-nav-link-clicked': sidebarPage === 1,
            })}>
            <div id="subordinates-icon" className="admin-subordinates"></div>
            <div id="subordinates-title">Subordinates</div>
          </div>
        )}

        {accessLevel === 3 && (
          <div
            onClick={onSidebarPageClick}
            id="users-wrapper"
            className={classNames('admin-sidebar-nav-link', {
              'admin-sidebar-nav-link-clicked': sidebarPage === 3,
            })}>
            <div id="users-icon" className="admin-patients"></div>
            <div id="users-title">All Users</div>
          </div>
        )}

        <div
          onClick={onSidebarPageClick}
          id="calculator-wrapper"
          className={classNames('admin-sidebar-nav-link', {
            'admin-sidebar-nav-link-clicked': sidebarPage === 2,
          })}>
          <div id="calculator-icon" className="admin-calculator"></div>
          <div id="calculator-title">Calculator</div>
        </div>

        {accessLevel === 1 && (
          <label
            htmlFor="file-input"
            // onClick={onImportClick}
            id="file-wrapper"
            className={classNames('admin-sidebar-nav-link', {
              'admin-sidebar-nav-link-clicked': sidebarPage === 4,
            })}>
            <div id="file-icon" className="admin-file"></div>
            <div id="file-title">Import File</div>
            <input
              onChange={onImportClick}
              onClick={onSidebarPageClick}
              type="file"
              id="file-input"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="input-file"
            />
          </label>
        )}
      </div>

      {sidebarPage === 0 && <AdminUserList onUserClick={onUserClick} type={'patients'} />}

      {sidebarPage === 2 && <HomeTestForm admin />}

      {sidebarPage === 1 && <AdminUserList onUserClick={onUserClick} type={'subordinates'} />}

      {sidebarPage === 3 && <AdminUserList onUserClick={onUserClick} type={'All Users'} search />}

      {sidebarPage === 4 && (
        <div className="test-results-container">
          <div className="test-results-title-area">
            <div className={'test-results-title'}>Imported Tests</div>
          </div>

          <div
            className="test-results-body"
            style={{ gridTemplateColumns: `repeat(2, max-content)` }}>
            {csvMeasurements.map((m, i) => {
              return (
                <div
                  className="table-row-csv"
                  style={{ gridTemplateColumns: `repeat(7, max-content)` }}
                  key={`measurement-${i}`}>
                  <div className="measure-column">
                    <div className="measure-label">No.</div>
                    <div className={'measure-value'}>{i + 1}</div>
                  </div>
                  <div className="measure-column">
                    <div className="measure-label">Date</div>
                    <div className={'measure-value'}>{m.DoB.toLocaleDateString('en-UK')}</div>
                  </div>
                  <div className="measure-column">
                    <div className="measure-label">Full Name</div>
                    <div className={'measure-value'}>{`${m.Name} ${m.Surname}`}</div>
                  </div>

                  <div className="measure-column">
                    <div className="measure-label">Gender</div>
                    <div className={'measure-value'}>{m.Gender === 0 ? 'Male' : 'Female'}</div>
                  </div>

                  <div className="measure-column">
                    <div className="measure-label">Ethnicity</div>
                    <div className={'measure-value'}>
                      {m.IsBlack ? 'African American/black' : 'other'}
                    </div>
                  </div>

                  <div className="measure-column">
                    <div className="measure-label">Result</div>
                    <div className={'measure-value'}>{parseFloat(m.result).toFixed(2)}</div>
                  </div>
                  <div className="measure-column">
                    <div className="measure-label">Stage</div>
                    <div className={'measure-value'}>{m.stage}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMain;
