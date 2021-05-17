import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Tag } from '@blueprintjs/core';
import { get, isEmpty, last, map, max, noop } from 'lodash';

import { getPrimaryColor, getRGBA } from '../../utils/style';
import { KEY_CODES } from '../../constants/event';

import Input from './Input';

const Wrapper = styled.div`
  min-height: 30px;
  padding: 0 28px 0 10px;
  outline: none;
  border: none;
  user-select: none;
  position: relative;
  border-radius: 6px;
  background-color: ${(props) => (props.disabled ? `#eeeeee` : '#fff')};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  color: ${(props) => (props.disabled ? `#999999` : 'inherit')};
  box-shadow: ${(props) =>
    props.disabled
      ? 'none'
      : `0 0 0 0 rgba(19, 124, 189, 0), 0 0 0 0 rgba(19, 124, 189, 0),inset 0 0 0 1px ${getRGBA(
          props.theme.BLACK,
          0.3
        )},inset 0 1px 1px ${getRGBA(props.theme.BLACK, 0.2)}`};
  transition: box-shadow 100ms cubic-bezier(0.4, 1, 0.75, 0.9);
  &:hover {
    box-shadow: ${(props) =>
      props.disabled
        ? 'none'
        : `0 0 0 1px ${getPrimaryColor(props.theme.PRIMARY_COLOR)},
      0 0 0 3px ${getRGBA(getPrimaryColor(props.theme.PRIMARY_COLOR), 0.3)},
      inset 0 1px 1px ${getRGBA(props.theme.BLACK, 0.2)}`};
  }
`;
const StyledTag = styled(Tag)`
  margin: 4px;
  padding: 3px 6px;
  vertical-align: middle;
`;

const Placeholder = styled.span`
  display: block;
  height: 30px;
  line-height: 30px;
  color: ${(props) => getRGBA(props.theme.GRAY1, 0.6)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  @media screen and (max-width: 1930px) {
    font-size: 14px;
  }
`;

const InputWrapper = styled.span`
  display: inline-block;
  position: relative;
  vertical-align: middle;
`;

const StyledInput = styled(Input)`
  & input {
    width: 100%;
    outline: none;
    border: none;
    box-shadow: none !important;
    background: none;
    padding: 0 !important;
    margin: 0;
    ::placeholder {
      color: ${(props) => getRGBA(props.theme.GRAY1, 0.6)};
    }
  }
`;

const InputMirror = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  white-space: nowrap;
  visibility: hidden;
`;

const RightElementWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;
const Info = styled.div`
  display: block;
  padding-top: 5px;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media screen and (max-width: 1930px) {
    font-size: 14px;
  }
`;
const MIN_INPUT_WIDTH = 20;

function MultipleSelect(props) {
  const {
    disabled,
    value,
    onRemove,
    rightElement,
    filterOption,
    placeholder,
    onFocus,
    onBlur,
    onChange,
    displayValueLength,
    isShowName,
    valueType,
  } = props;
  const [inputValue, setInputValue] = useState('');
  const [inputWidth, setInputWidth] = useState(0);
  const measureRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (measureRef && measureRef.current) {
      setInputWidth(max([measureRef.current.scrollWidth, MIN_INPUT_WIDTH]));
    }
  }, [inputValue]);

  const getInputStyle = () => {
    return {
      width: isEmpty(value) ? '' : `${inputWidth}px`,
      maxWidth: '100px',
    };
  };

  const handleClick = () => {
    if (disabled) {
      return;
    }
    if (filterOption && inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemove = (value, tagProps, event) => {
    onRemove(value, event);
  };

  const handleInput = (value) => {
    setInputValue(value);
    onChange(value);
  };

  const handleInputKeyDown = (event) => {
    if (event.keyCode === KEY_CODES.BACKSPACE || event.keyCode === KEY_CODES.DELETE) {
      if (!inputValue && !isEmpty(value)) {
        onRemove(get(last(value), 'value', ''), event);
      }
    }
  };
  const style = props.maxHeight ? { maxHeight: props.maxHeight, overflowY: 'auto' } : {};
  return (
    <Wrapper
      disabled={disabled}
      onClick={handleClick}
      className={'AdvancedSelect-Multiple-Select-Wrapper'}
      style={style}
    >
      <div>
        {!filterOption && isEmpty(value) && <Placeholder>{placeholder}</Placeholder>}
        {!isEmpty(value) && displayValueLength ? (
          <Info>
            已选择{value.length}个{valueType}
          </Info>
        ) : (
          map(value, (item) => {
            const text = item.label || item.name || item.value;
            return (
              <StyledTag
                key={item.value}
                onRemove={
                  disabled
                    ? undefined
                    : (event, tagProps) =>
                        handleRemove(isShowName ? item : item.value, tagProps, event)
                }
                minimal
              >
                {text}
              </StyledTag>
            );
          })
        )}
        {filterOption && (
          <InputWrapper style={getInputStyle()}>
            <StyledInput
              type={'text'}
              disabled={disabled}
              onKeyDown={handleInputKeyDown}
              inputRef={inputRef}
              placeholder={isEmpty(value) ? placeholder : ''}
              onFocus={onFocus}
              onBlur={onBlur}
              onInput={handleInput}
            />
            <InputMirror ref={measureRef} aria-hidden>
              {inputValue}&nbsp;
            </InputMirror>
          </InputWrapper>
        )}
      </div>
      <RightElementWrapper>{rightElement}</RightElementWrapper>
    </Wrapper>
  );
}

MultipleSelect.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.array,
  placeholder: PropTypes.string,
  rightElement: PropTypes.element,
  filterOption: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  onRemove: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  isShowName: PropTypes.bool,
  displayValueLength: PropTypes.bool,
  maxHeight: PropTypes.number,
  valueType: PropTypes.string,
};

MultipleSelect.defaultProps = {
  disabled: false,
  value: [],
  placeholder: '请选择',
  filterOption: false,
  onRemove: noop,
  onFocus: noop,
  onBlur: noop,
  onChange: noop,
  isShowName: false,
  displayValueLength: false,
  maxHeight: null,
  valueType: '',
};

export default MultipleSelect;
