import React, { useCallback, useEffect, useState } from 'react';
import './../../assets/styles/home-form.css';
import classNames from 'classnames';

function TextInput({
  label,
  required = false,
  placeholder,
  id,
  result = false,
  valueRef = { current: undefined },
  errorTypes = {},
  prefilled = false,
  defaultValue = undefined,
}) {
  const [isColored, setColored] = useState(prefilled ? true : null);

  const [textValue, setTextValue] = useState(
    defaultValue !== undefined ? defaultValue.toString() : valueRef.current,
  );

  const toggleFocusOut = useCallback(() => {
    if (prefilled) return null;
    if (isColored !== null) setColored(false);
  }, [isColored]);

  const toggleFocusIn = useCallback(() => {
    if (prefilled) return null;
    setColored(true);
  }, []);

  const onInputChange = useCallback(
    (e) => {
      if (prefilled) return null;
      if (errorTypes[id]) delete errorTypes[id];
      valueRef.current = e.target.value;
      setTextValue(e.target.value);
    },
    [errorTypes],
  );

  useEffect(() => {
    if (valueRef.current !== undefined)
      if (valueRef.current !== textValue) setTextValue(valueRef.current);

    return () => {
      if (valueRef.current !== undefined)
        if (valueRef.current !== textValue) setTextValue(valueRef.current);
    };
  }, [valueRef.current]);

  return (
    <div className="input-base">
      <div
        className={classNames('input-area', {
          'input-area-err': errorTypes[id] !== undefined,
          'input-area-color-in': isColored === true || textValue.length > 0 || result,
          'input-area-color-out': isColored === false && textValue.length <= 0,
        })}
        onBlur={toggleFocusOut}
        onFocus={toggleFocusIn}>
        <label
          htmlFor={id}
          className={classNames('input-label', {
            'input-label-rs': result || prefilled,
            'input-label-err': errorTypes[id] !== undefined,
          })}>
          {label}
          {required ? <span> *</span> : null}
        </label>
        <input
          onChange={onInputChange}
          disabled={result || prefilled}
          // type={prefilled ? 'password' : type}
          className={classNames('form-input', { 'form-input-rs': result || prefilled })}
          placeholder={placeholder}
          id={id}
          value={textValue}
        />
      </div>
      {errorTypes[id] !== undefined && (
        <label htmlFor={id} className={'input-label-err'}>
          {errorTypes[id]}
        </label>
      )}
    </div>
  );
}

export default TextInput;
