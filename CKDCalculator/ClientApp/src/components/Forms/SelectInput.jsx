import React, { useCallback, useEffect, useRef, useState } from 'react';
import './../../assets/styles/home-form.css';
import classNames from 'classnames';

const SelectInput = ({
  valueRef,
  label,
  required = false,
  placeholder,
  id,
  values,
  errorTypes,
  prefilled = false,
}) => {
  const [isFocused, setFocused] = useState(false),
    [inputValue, setInputValue] = useState(valueRef.current),
    selectRef = useRef(null);

  if (inputValue !== valueRef.current) setInputValue(valueRef.current);

  const toggleInputFocus = useCallback(
    (e) => {
      if (prefilled === true) return null;
      if (!isFocused) setFocused(true);
    },
    [isFocused, prefilled],
  );

  const onInputChange = useCallback(
    (e) => {
      if (prefilled) return null;
      valueRef.current = e.target.value.trim();
      setInputValue(e.target.value.trim());

      if (errorTypes[id]) delete errorTypes[id];
    },
    [errorTypes],
  );

  const onSelectValue = useCallback(
    (e) => {
      if (prefilled) return null;
      setFocused(false);
      valueRef.current = e.target.innerHTML;
      setInputValue(e.target.innerHTML);

      if (errorTypes[id]) delete errorTypes[id];
    },
    [errorTypes],
  );

  useEffect(() => {
    const onOutsideClick = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setFocused(false);
      }
    };

    document.addEventListener('click', onOutsideClick);

    return () => {
      document.removeEventListener('click', onOutsideClick);
    };
  }, [selectRef]);

  return (
    <div>
      <div
        ref={selectRef}
        className={classNames('select-area', {
          'select-area-err': errorTypes[id] !== undefined,
          'select-area-color-in': isFocused || inputValue.length > 0,
        })}
        onFocus={toggleInputFocus}>
        <label
          htmlFor={id}
          className={classNames('input-label', {
            'input-label-err': errorTypes[id] !== undefined,
          })}>
          {label}
          {required ? <span> *</span> : null}
        </label>
        <input
          onChange={onInputChange}
          // type={prefilled ? 'password' : type}
          className={'select-input'}
          placeholder={placeholder}
          value={inputValue}
          id={id}
          disabled={prefilled}
        />
        {isFocused && (
          <div className="select-options">
            {values.map((value, i) => {
              if (value === null) return null;
              if (inputValue === '')
                return (
                  <div
                    key={`${id}-select-${i}`}
                    onClick={onSelectValue}
                    className="select-option-item">
                    {value}
                  </div>
                );
              else if (value.includes(inputValue))
                return (
                  <div
                    key={`${id}-select-${i}`}
                    onClick={onSelectValue}
                    className="select-option-item">
                    {value}
                  </div>
                );
            })}
          </div>
        )}
      </div>
      {errorTypes[id] !== undefined && (
        <label htmlFor={id} className={'input-label-err'}>
          {errorTypes[id]}
        </label>
      )}
    </div>
  );
};

export default SelectInput;
