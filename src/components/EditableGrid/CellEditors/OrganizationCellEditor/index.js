import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import AdvancedSearch, { SELECT_MODE } from '../../../AdvancedSearch';
import { searchSystemNodes, SELECT_TYPE } from '../../../AdvancedSearch/constant';

class OrganizationCellEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      value: props.value,
    };
  }

  isPopup() {
    return true;
  }

  getValue() {
    return this.state.value;
  }

  handleSelect = (data) => {
    this.setState({
      value: { ...this.state.value, value: data },
      isOpen: false,
    });
  };

  handleClosed = () => {
    this.setState({ isOpen: false }, this.props.stopEditing);
  };

  render() {
    const { isOpen, value } = this.state;
    const {
      colDef: { multipleChoice },
    } = this.props;
    return (
      <>
        <AdvancedSearch
          title={'选择组织'}
          assignSelectMode={SELECT_MODE.TREE}
          isOpen={isOpen}
          multiple={multipleChoice}
          allowedNodeType={SELECT_TYPE.ORGANIZATION}
          selectedData={get(value, 'value', [])}
          searchParams={{
            system: SELECT_TYPE.ORGANIZATION,
          }}
          fetchHandler={searchSystemNodes}
          onClosed={this.handleClosed}
          onSelect={this.handleSelect}
        />
      </>
    );
  }
}

OrganizationCellEditor.propTypes = {
  value: PropTypes.object,
};

OrganizationCellEditor.defaultProps = {};

export default OrganizationCellEditor;
