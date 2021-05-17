import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { filter, get, includes, map, sortBy } from 'lodash';

import SelectCellEditor from '../../components/SelectCellEditor';

class MiscSelectCellEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  isPopup() {
    return true;
  }

  getValue() {
    return this.state.value;
  }

  handleChange = (value) => {
    const { colDef } = this.props;
    const matchedOptions = filter(colDef.data, (item) => includes(value, item.id));
    this.setState({ value: { ...this.state.value, value: matchedOptions } });
  };

  render(props) {
    const { column, colDef, multiple } = this.props;
    const value = sortBy(
      map(get(this.state.value, 'value', []), (item) => item.id),
      'sortId'
    );
    const options = sortBy(get(colDef, 'data', []), 'sortId');
    return (
      <SelectCellEditor
        selectOptions={{ multiple }}
        value={value}
        options={options}
        column={column}
        onChange={this.handleChange}
      />
    );
  }
}

MiscSelectCellEditor.propTypes = {
  value: PropTypes.object,
  multiple: PropTypes.bool, // 是否多选
};

MiscSelectCellEditor.defaultProps = {
  multiple: false,
};

export default MiscSelectCellEditor;
