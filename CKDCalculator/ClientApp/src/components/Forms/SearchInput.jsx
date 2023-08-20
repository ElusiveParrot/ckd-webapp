import React, { useCallback, useEffect, useState } from 'react';
import './../../assets/styles/home-form.css';
import classNames from 'classnames';

function SearchInput({ placeholder, id, valueRef, callback }) {
  const [isColored, setColored] = useState(null);

  const [textValue, setTextValue] = useState(valueRef.current);

  const toggleFocusOut = useCallback(() => {
    if (isColored !== null) setColored(false);
  }, [isColored]);

  const toggleFocusIn = useCallback(() => {
    setColored(true);
  }, []);

  const onInputChange = useCallback((e) => {
    valueRef.current = e.target.value;
    setTextValue(e.target.value);
  }, []);

  useEffect(() => {
    if (valueRef.current !== undefined)
      if (valueRef.current !== textValue) setTextValue(valueRef.current);

    return () => {
      if (valueRef.current !== undefined)
        if (valueRef.current !== textValue) setTextValue(valueRef.current);
    };
  }, [valueRef.current]);

  return (
    <div>
      <form
        onSubmit={callback}
        className={classNames('input-area search-area', {
          'input-area-color-in': isColored === true || textValue.length > 0,
          'input-area-color-out': isColored === false && textValue.length <= 0,
        })}
        onBlur={toggleFocusOut}
        onFocus={toggleFocusIn}>
        <input
          onChange={onInputChange}
          className={classNames('search-input')}
          placeholder={placeholder}
          id={id}
          value={textValue}
        />

        <button className="search-icon">search</button>
      </form>
    </div>
  );
}

export default SearchInput;
