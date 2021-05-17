import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Box = styled.div`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  vertical-align: middle;
  line-height: 18px;
  border-radius: 4px;
  margin: 0 6px;
  font-weight: 500;
`;

const Add = styled(Box)`
  border: 1px solid #009944;
  color: #009944;
`;

const Del = styled(Box)`
  border: 1px solid #7f7f7f;
  color: #7f7f7f;
`;

const EnhanceDel = styled(Box)`
  border: 1px solid #ff0000;
  color: #ff0000;
`;
const Mod = styled(Box)`
  border: 1px solid #fd9b02;
  color: #fd9b02;
`;

const ICON = {
  ADDED: <Add>增</Add>,
  DELETED: <Del>删</Del>,
  MODIFIED: <Mod>改</Mod>,
  ENHANCE_DEL: <EnhanceDel>删</EnhanceDel>,
};

function StatusIcon(props) {
  const { type, isEnhanceDelete } = props;
  if (type) {
    return isEnhanceDelete ? ICON.ENHANCE_DEL : ICON[type];
  } else {
    return <Box />;
  }
}

StatusIcon.propTypes = {
  isEnhanceDelete: PropTypes.bool,
};

StatusIcon.defaultProps = {
  isEnhanceDelete: false,
};

export default StatusIcon;
