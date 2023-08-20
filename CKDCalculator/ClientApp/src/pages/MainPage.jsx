import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { HomeTestForm } from '../components';
import './../assets/styles/main.css';
const MainPage = ({ setAppState, appState }) => {
  const accessLevel = useSelector(({ user }) => {
    if (user !== null) return user.accessLevel;
    return null;
  }, shallowEqual);

  return (
    <div className="home-container">
      <div className="main-img-bg" id="home">
        <div className="img-central-block">
          <div className="img-second-title">Get a test today</div>
          <div className="img-first-title">
            An early diagnosis of Kidney conditions can save lifes
          </div>
          <a href="/#test" className="img-button">
            Get Started
          </a>
        </div>
      </div>

      <div className="about-block" id="about">
        <div className="about-content">
          <div className="about-title">Our mission</div>
          <div className="about-info">
            We at K-Devs are a group of 8 members that have developed an information system solution
            which can be used by the NHS Clinicians for information regarding Chronic Kidney
            Disease. With this tool we have created it provides a website for patients, and visitors
            for information regarding Chronic Kidney Disease, to calculate the risk of Chronic
            Kidney Disease in patients and expert patients. The goal of our company is everyone
            being educated about Chronic Kidney Disease and calculating risks for Chronic Kidney
            Disease.
          </div>
        </div>

        <div className="about-img"></div>
      </div>

      <div className="ckd-stages-container" id="stages">
        <div className="ckd-stage-blocks">
          <div className="ckd-stage-block block-1">
            <div className="ckd-stage-number">1</div>
            <div className="ckd-stage-info">
              <div className="ckd-stage-title">
                <div>STAGE 1 (90+ mL/min)</div>
              </div>
              <div className="ckd-stage-body">
                There are usually no symptoms to indicate the kidneys are damaged. Because kidneys
                do a good job even when they’re not functioning at 100 percent.
              </div>
            </div>
          </div>
          <div className="ckd-stage-block block-2">
            <div className="ckd-stage-number">2</div>
            <div className="ckd-stage-info">
              <div className="ckd-stage-title">
                <div>STAGE 2 (60-89 mL/min)</div>
              </div>
              <div className="ckd-stage-body">
                There are usually no symptoms to indicate the kidneys are damaged. Because kidneys
                do a good job even when they’re not functioning at 100 percent.
              </div>
            </div>
          </div>
          <div className="ckd-stage-block block-3">
            <div className="ckd-stage-number">3</div>
            <div className="ckd-stage-info">
              <div className="ckd-stage-title">
                <div>STAGE 3A (GFR = 45-59 mL/min)</div>
              </div>
              <div className="ckd-stage-body">
                A person with stage 3 chronic kidney disease has moderate kidney damage. As kidney
                function declines waste products can build up in the blood.
              </div>
            </div>
          </div>

          <div className="ckd-stage-block block-4">
            <div className="ckd-stage-number">4</div>
            <div className="ckd-stage-info">
              <div className="ckd-stage-title">
                <div>STAGE 3B (GFR = 30-44 mL/min)</div>
              </div>
              <div className="ckd-stage-body">
                A person with stage 3 chronic kidney disease has moderate kidney damage. As kidney
                function declines waste products can build up in the blood.
              </div>
            </div>
          </div>

          <div className="ckd-stage-block block-5">
            <div className="ckd-stage-number">5</div>
            <div className="ckd-stage-info">
              <div className="ckd-stage-title">
                <div>STAGE 4 (GFR = 15-29 mL/min)</div>
              </div>
              <div className="ckd-stage-body">
                A person with stage 4 chronic kidney disease has advanced kidney damage. It is
                likely someone with stage 4 CKD will need dialysis or a kidney transplant in the
                near future.
              </div>
            </div>
          </div>

          <div className="ckd-stage-block block-6">
            <div className="ckd-stage-number">6</div>
            <div className="ckd-stage-info">
              <div className="ckd-stage-title">
                <div>STAGE 5 (GFR = 0-14 mL/min)</div>
              </div>
              <div className="ckd-stage-body">
                A person with stage 5 chronic kidney disease has nearly lost all functionality of
                their kidneys, requiring significant medical care.
              </div>
            </div>
          </div>
        </div>
      </div>

      <HomeTestForm appState={appState} setAppState={setAppState} />
    </div>
  );
};

export default MainPage;
