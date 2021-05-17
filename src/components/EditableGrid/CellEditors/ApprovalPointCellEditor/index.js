import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isNil, map } from 'lodash';

import EditApprovalContent from '../../../../containers/PrList/components/EditPrsItems/WorkFlowTable/EditApprovalContent';

class ApprovalPointCellEditor extends Component {
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

  handleChange = ({ values }) => {
    const newValues = isNil(values) ? [] : values;
    this.setState({
      value: { ...this.state.value, values: newValues },
    });
  };

  handleClosed = () => {
    // 将stopEditing放在setState回调里是为了确保handleChange已经将新的value set完成
    this.setState({ isOpen: false }, this.props.stopEditing);
  };

  render() {
    const { isOpen, value } = this.state;
    const { commonApprovalPointConfig, specialApprovalPointConfig, colDef } = this.props;
    const specialConfig = map(specialApprovalPointConfig, (item) => item);
    const { headerName } = colDef;
    return (
      <>
        {isOpen && (
          <EditApprovalContent
            title={headerName}
            data={value ? value : {}}
            commonConfig={commonApprovalPointConfig}
            specialConfig={specialConfig}
            onChange={this.handleChange}
            onClosed={this.handleClosed}
          />
        )}
      </>
    );
  }
}

ApprovalPointCellEditor.propTypes = {
  commonApprovalPointConfig: PropTypes.object,
  specialApprovalPointConfig: PropTypes.object,
};

ApprovalPointCellEditor.defaultProps = {
  commonApprovalPointConfig: {},
  specialApprovalPointConfig: {},
};

export default ApprovalPointCellEditor;
