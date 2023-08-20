import React from 'react';
import { HashLink } from 'react-router-hash-link';
import './../../assets/styles/footer.css';

function Footer() {
  return (
    <div className="footer">
      <div className="f-links">
        <div className="auth-section">
          © 2023 by K-DEVS. Powered and secured by Kingston University
        </div>

        <div className="footer-nav">
          <HashLink to="/#home" className="f-nav-item">
            Home
          </HashLink>
          <HashLink to="/#about" className="f-nav-item">
            About us
          </HashLink>
          <HashLink to="/#stages" className="f-nav-item">
            Stages
          </HashLink>
          <HashLink to="/#test" className="f-nav-item">
            Tests
          </HashLink>
        </div>
      </div>
    </div>
  );
}

export default Footer;
