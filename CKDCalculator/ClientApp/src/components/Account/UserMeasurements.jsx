import React, { useEffect, useRef, useState } from 'react';

function UserMeasurements({ measures }) {
  const [bodyColumns, setBodyColumns] = useState(1);

  const resultsBody = useRef(),
    searchRef = useRef('');

  const getStage = (rs) => {
    if (rs >= 90) return 1;

    if (rs >= 60) return 2;

    if (rs >= 45) return 3;

    if (rs >= 30) return 4;

    if (rs >= 15) return 5;

    return 6;
  };

  useEffect(() => {
    if (resultsBody.current) {
      setBodyColumns(Math.floor(resultsBody.current.offsetWidth / 350));
    }
  }, []);

  useEffect(() => {
    const onWindowResize = () => {
      if (resultsBody.current) {
        setBodyColumns(Math.floor(resultsBody.current.offsetWidth / 350));
      }
    };

    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return (
    <div className="test-results-container">
      <div className="test-results-title-area">
        <div className={'test-results-title'}>Test History</div>
      </div>

      <div
        className="test-results-body"
        ref={resultsBody}
        style={{ gridTemplateColumns: `repeat(${bodyColumns}, max-content)` }}>
        {measures.map((m, i) => {
          return (
            <div className="measure-row" key={`measurement-${i}`}>
              <div className="measure-column">
                <div className="measure-label">No.</div>
                <div className={'measure-value'}>{i + 1}</div>
              </div>
              <div className="measure-column">
                <div className="measure-label">Date</div>
                <div className={'measure-value'}>
                  {new Date(m.DateAndTime).toLocaleDateString('en-UK')}
                </div>
              </div>
              <div className="measure-column">
                <div className="measure-label">Result</div>
                <div className={'measure-value'}>{parseFloat(m.Result).toFixed(2)}</div>
              </div>
              <div className="measure-column">
                <div className="measure-label">Stage</div>
                <div className={'measure-value'}>{getStage(m.Result)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserMeasurements;
