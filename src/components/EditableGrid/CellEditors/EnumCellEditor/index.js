import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { find, get, head, sortBy } from 'lodash';

import SelectCellEditor from '../../components/SelectCellEditor';

class EnumCellEditor extends Component {
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
    const enumId = head(value);
    if (enumId) {
      const { colDef } = this.props;
      const matchedEnumOption = find(colDef.data, (item) => item.id === enumId);
      if (matchedEnumOption) {
        this.setState(
          { value: { ...this.state.value, enumId: matchedEnumOption.id } },
          this.props.stopEditing
        );
      } else {
        this.props.stopEditing();
      }
    } else {
      this.props.stopEditing();
    }
  };

  render(props) {
    const { column, colDef } = this.props;
    const { value } = this.state;
    const enumId = get(value, 'enumId', '');
    const options = sortBy(get(colDef, 'data', []), 'sortId');
    return (
      <SelectCellEditor
        value={[enumId]}
        options={options}
        column={column}
        onChange={this.handleChange}
      />
    );
  }
}

EnumCellEditor.propTypes = {
  value: PropTypes.object,
};

EnumCellEditor.defaultProps = {};

export default EnumCellEditor;
