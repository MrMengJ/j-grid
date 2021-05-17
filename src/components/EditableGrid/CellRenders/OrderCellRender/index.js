import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import EventListener from 'react-event-listener';
import { get, isEmpty, noop } from 'lodash';

import { getStyle } from '../../helper';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100%;
  padding: 0 8px;
`;

const Bar = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 8px;
  cursor: s-resize;
`;

const MarkLine = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 1px;
  background-color: #3c9aff;
  z-index: 1;
`;

const MIN_ROW_HEIGHT = 10;

class OrderCellRender extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      startCoords: {},
      currentCoords: {},
      gridOffset: {},
      isDragging: false,
    };
  }

  componentDidMount() {
    const eGridDiv = get(this.props.api, 'gridCore.eGridDiv');

    if (eGridDiv) {
      const { left, top } = eGridDiv.getBoundingClientRect();
      this.setState({
        gridOffset: { left, top },
      });
    }
  }

  refresh(params) {
    const { value } = params;
    this.setState({
      value,
    });

    // return true to tell the grid we refreshed successfully
    return true;
  }

  handleDragBarMouseDown = (event) => {
    const { clientX, clientY } = event;
    this.setState({
      startCoords: {
        x: clientX,
        y: clientY,
      },
    });
  };

  handleGridMouseMove = (event) => {
    const isDownLeftBtn = event.which === 1;
    const { startCoords } = this.state;
    if (isEmpty(startCoords) || !isDownLeftBtn) {
      return;
    }

    // stopPropagation to prevent grid range selection
    event.stopPropagation();

    const { clientY } = event;
    const startYCoords = get(startCoords, 'y', 0);
    const { isDragging } = this.state;
    if (!isDragging) {
      if (Math.abs(clientY - startYCoords) > 1) {
        this.setState({
          isDragging: true,
        });
      }
    }

    if (isDragging) {
      const { clientX, clientY } = event;
      const {
        node: { rowHeight },
      } = this.props;
      const delta = clientY - startYCoords;
      if (rowHeight + delta <= MIN_ROW_HEIGHT) {
        return;
      }
      this.setState({
        currentCoords: {
          x: clientX,
          y: clientY,
        },
      });
    }
  };

  handleGridMouseUp = (event) => {
    const { isDragging, startCoords } = this.state;
    if (isDragging) {
      const { clientY } = event;
      const { node, api, onRowHeightChanged } = this.props;
      const { rowHeight } = node;
      const startYCoords = get(startCoords, 'y', 0);
      const delta = clientY - startYCoords;
      const newHeight = Math.round(rowHeight + delta);
      node.setRowHeight(newHeight);
      api.onRowHeightChanged();
      onRowHeightChanged({ data: node.data, rowHeight: newHeight });
      this.setState({
        isDragging: false,
        startCoords: {},
        currentCoords: {},
      });
    }
  };

  handleGridMouseLeave = () => {
    const { isDragging } = this.state;
    if (isDragging) {
      this.setState({
        isDragging: false,
        startCoords: {},
        currentCoords: {},
      });
    }
  };

  getMarkLineStyle = () => {
    const eGridDiv = get(this.props.api, 'gridCore.eGridDiv');
    const { isDragging } = this.state;
    if (!eGridDiv || !isDragging) {
      return {};
    }
    const { gridOffset, currentCoords } = this.state;
    const gridWidth = getStyle(eGridDiv, 'width');
    const gridOffsetLeft = get(gridOffset, 'left', 0);
    const currentYCoords = get(currentCoords, 'y', 0);
    return {
      width: gridWidth,
      transform: `translate(${gridOffsetLeft}px,${currentYCoords}px)`,
    };
  };

  render() {
    const { api } = this.props;
    const { value } = this.state;
    const { isDragging } = this.state;
    const eGridDiv = get(api, 'gridCore.eGridDiv');
    return (
      <>
        <Wrapper>
          {value.rowIndex}
          <Bar onMouseDown={this.handleDragBarMouseDown} />
          {isDragging && eGridDiv && <MarkLine style={this.getMarkLineStyle()} />}
        </Wrapper>
        {eGridDiv && (
          <EventListener
            target={eGridDiv}
            onMouseMove={this.handleGridMouseMove}
            onMouseUp={this.handleGridMouseUp}
            onMouseLeave={this.handleGridMouseLeave}
          />
        )}
      </>
    );
  }
}

OrderCellRender.propTypes = {
  value: PropTypes.object.isRequired,
  onRowHeightChanged: PropTypes.func,
};

OrderCellRender.defaultProps = {
  onRowHeightChanged: noop,
};

export default OrderCellRender;
