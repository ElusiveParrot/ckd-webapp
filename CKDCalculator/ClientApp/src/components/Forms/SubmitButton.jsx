import React from 'react';
import './../../assets/styles/home-form.css';

function SubmitButton({
  label,
  callback,
  marginTop = '0px',
  gradientValues = ['#203d60', '#19304d'],
}) {
  return (
    <button
      className="form-button"
      onClick={callback}
      style={{
        marginTop: marginTop,
        backgroundImage: `linear-gradient(${gradientValues[0]}, ${gradientValues[1]})`,
      }}>
      {label}
    </button>
  );
}

export default SubmitButton;
