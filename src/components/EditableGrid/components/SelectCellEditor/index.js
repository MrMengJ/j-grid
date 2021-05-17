import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Classes } from '@blueprintjs/core';
import { map, noop } from 'lodash';

import AdvancedSelect from '../../../AdvancedSelect';
import Option from '../../../AdvancedSelect/Option';
import { getColumnWidth } from '../../helper';

const StyledAdvancedSelect = styled(AdvancedSelect)`
  &:hover {
    .${Classes.INPUT} {
      box-shadow: none;
    }
  }

  .${Classes.INPUT} {
    box-shadow: none;
  }

  .AdvancedSelect-Multiple-Select-Wrapper {
    box-shadow: none;
    &:hover {
      box-shadow: none;
    }
  }
`;

class SelectCellEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  handleChange = (value) => {
    this.props.onChange(value);
  };

  render(props) {
    const { value, options, column, selectOptions } = this.props;
    const width = getColumnWidth(column) - 2; // 2 is left border width plus right border width
    return (
      <StyledAdvancedSelect
        {...selectOptions}
        defaultIsOpen
        boundary={'window'}
        value={value}
        width={width}
        onChange={this.handleChange}
      >
        {map(options, (option) => {
          const { id, name } = option;
          return <Option key={id} value={id} label={name} />;
        })}
      </StyledAdvancedSelect>
    );
  }
}

SelectCellEditor.propTypes = {
  column: PropTypes.object.isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func,
  selectOptions: PropTypes.object,
};

SelectCellEditor.defaultProps = {
  selectOptions: {},
  value: [],
  onChange: noop,
};

export default SelectCellEditor;
