import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import { get } from 'lodash';

import GroupRichSelector from '../../../../containers/PrList/components/EditPrsItems/AuthScopeGroupSelect/GroupRichSelector';

class AuthTagCellEditor extends Component {
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
    // 将stopEditing放在setState回调里是为了确保已经将新的value set完成
    this.setState(
      { value: { ...this.state.value, value: data }, isOpen: false },
      this.props.stopEditing
    );
  };

  handleClose = () => {
    this.setState({ isOpen: false }, this.props.stopEditing);
  };

  render() {
    const { isOpen, value } = this.state;
    return (
      <>
        {isOpen && (
          <GroupRichSelector
            title={i18next.t('authScope')}
            isOpen={isOpen}
            selectedData={get(value, 'value', [])}
            handleClose={this.handleClose}
            handleSelect={this.handleSelect}
          />
        )}
      </>
    );
  }
}

AuthTagCellEditor.propTypes = {
  value: PropTypes.object,
};

AuthTagCellEditor.defaultProps = {};

export default AuthTagCellEditor;
