import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Classes, MenuItem, Popover, Position } from '@blueprintjs/core';
import { isNil, noop } from 'lodash';

import Tab from '../../../Tabs/Tab';
import Tabs from '../../../Tabs';
import { getPrimaryColor, getRGBA } from '../../../../utils/style';
import Menu from '../../../Menu';
import Icon from '../../../Icon';
import { ICONS } from '../../icons';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Label = styled.span`
  display: flex;
  flex: 1 1 auto;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  text-overflow: ellipsis;
  align-self: stretch;
`;

const Text = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPopover = styled(Popover)`
  height: 16px;
`;

const MenuIconItem = styled.span`
  transition: opacity 0.2s;
  opacity: ${(props) => (props.isShow ? 1 : 0)};
`;

const ContentWrapper = styled.div`
  min-width: 240px;
  border: 1px solid #babfc7;
  box-shadow: 0 1px 4px 1px ${getRGBA('#babfc7', 0.4)};
`;

const TabContent = styled.div`
  cursor: default;
  padding: 6px 0;
`;

const TabItemMenuIconWrapper = styled.div`
  min-width: 238px;
  text-align: center;
`;

const TabMenuIconItem = styled.span`
  display: block;
  speak: none;
  box-sizing: border-box;
  outline: none;
  font-family: 'agGridAlpine';
  font-size: 16px;
  line-height: 16px;
  font-style: normal;
  font-weight: normal;
  font-feature-settings: normal;
  font-variant: normal;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  color: ${(props) => getPrimaryColor(props.theme.PRIMARY_COLOR)};
  :before {
    content: '\\f11b';
  }
`;

const StyledTabs = styled(Tabs).attrs((props) => {
  return {
    theme: getPrimaryColor(props.theme.PRIMARY_COLOR),
  };
})`
  border-bottom: solid 1px;
  border-bottom-color: #babfc7;
`;

const StyledMenu = styled(Menu)`
  color: #000;
  padding: 0;
  min-width: 120px;
  .${Classes.MENU_SUBMENU} {
    outline: none !important;
    .${Classes.POPOVER_WRAPPER} {
      outline: none !important;
      .${Classes.POPOVER_TARGET} {
        outline: none !important;
      }
    }
  }
  .${Classes.MENU_ITEM} {
    line-height: 16px;
    padding: 8px 0;
    align-items: center;
    outline: none !important;
    :hover {
      background-color: ${(props) =>
        getRGBA(getPrimaryColor(props.theme.PRIMARY_COLOR), 0.1)};
    }
  }
  .${Classes.MENU_SUBMENU}
    .${Classes.POPOVER_TARGET}.${Classes.POPOVER_OPEN}
    > .${Classes.MENU_ITEM} {
    background-color: ${(props) =>
      getRGBA(getPrimaryColor(props.theme.PRIMARY_COLOR), 0.1)};
  }
  .${Classes.ICON} {
    color: #000;
    padding: 0 0 0 12px;
    margin: 0;
  }
  .${Classes.TEXT_OVERFLOW_ELLIPSIS}.${Classes.FILL} {
    padding: 0 12px;
    margin: 0;
  }
  .${Classes.ICON}.bp3-icon-caret-right {
    padding: 0 6px 0 0;
    margin: 0;
  }

  .${Classes.MENU_SUBMENU} {
    .${Classes.POPOVER}.${Classes.MINIMAL}.${Classes.MENU_SUBMENU} {
      border: 1px solid #babfc7;
      box-shadow: 0 1px 4px 1px ${getRGBA('#babfc7', 0.4)};
      .${Classes.MENU} {
        min-width: 120px;
        padding: 6px 0;
      }
    }
  }
`;

const MenuItemPlaceholder = styled.div`
  padding: 0 0 0 12px;
  margin: 0;
  width: 16px;
  font-size: 16px;
  line-height: 16px;
  box-sizing: content-box;
`;

const MenuItemPinIcon = styled(Icon)`
  padding: 0 0 0 12px;
  margin: 0;
`;

const MenuItemTickIcon = styled.span`
  padding: 0 0 0 12px;
  margin: 0;
  display: block;
  speak: none;
  font-family: 'agGridAlpine';
  font-size: 16px;
  line-height: 16px;
  font-style: normal;
  font-weight: normal;
  font-feature-settings: normal;
  font-variant: normal;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  :before {
    content: '\\f12c';
  }
`;

class HeaderGroupRender extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowMenuIcon: false,
    };
  }

  handleMouseEnter = () => {
    this.setState({
      isShowMenuIcon: true,
    });
  };

  handleMouseLeave = () => {
    this.setState({
      isShowMenuIcon: false,
    });
  };

  handleHideCol = () => {
    const {
      columnGroup: { children },
    } = this.props;
    this.props.onHideCol(children);
  };

  renderPopoverContent = () => {
    const { columnGroup } = this.props;
    const { pinned } = columnGroup;
    return (
      <ContentWrapper>
        <StyledTabs selectedId={'general'}>
          <Tab
            id={'general'}
            title={
              <TabItemMenuIconWrapper>
                <TabMenuIconItem />
              </TabItemMenuIconWrapper>
            }
            style={{
              padding: '9px 0',
            }}
          />
        </StyledTabs>
        <TabContent>
          <StyledMenu>
            <MenuItem
              icon={
                <MenuItemPinIcon icon={ICONS.PIN} viewBox={'0 0 32 32'} color={'#000'} />
              }
              text={'列固定'}
            >
              <MenuItem
                text={'向左固定'}
                icon={
                  pinned === 'left' ? (
                    <MenuItemTickIcon color={'#000'} />
                  ) : (
                    <MenuItemPlaceholder />
                  )
                }
              />
              <MenuItem
                text={'向右固定'}
                icon={
                  pinned === 'right' ? (
                    <MenuItemTickIcon color={'#000'} />
                  ) : (
                    <MenuItemPlaceholder />
                  )
                }
              />
              <MenuItem
                text={'不固定'}
                icon={
                  isNil(pinned) ? (
                    <MenuItemTickIcon color={'#000'} />
                  ) : (
                    <MenuItemPlaceholder />
                  )
                }
              />
            </MenuItem>
            <MenuItem
              text={'隐藏列'}
              icon={<MenuItemPlaceholder />}
              onClick={this.handleHideCol}
            />
          </StyledMenu>
        </TabContent>
      </ContentWrapper>
    );
  };

  renderMenuIcon = () => {
    const { isShowMenuIcon } = this.state;
    return (
      <StyledPopover
        minimal
        boundary={'window'}
        placement={Position.BOTTOM}
        modifiers={{
          preventOverflow: {
            enabled: true,
          },
        }}
        content={this.renderPopoverContent()}
      >
        <MenuIconItem className="ag-icon ag-icon-menu" isShow={isShowMenuIcon} />
      </StyledPopover>
    );
  };

  render() {
    const { displayName } = this.props;
    return (
      <Wrapper onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        <Label>
          <Text>{displayName}</Text>
        </Label>
        {this.renderMenuIcon()}
      </Wrapper>
    );
  }
}

HeaderGroupRender.propTypes = {
  displayName: PropTypes.string,
  onHideCol: PropTypes.func,
};

HeaderGroupRender.defaultProps = {
  displayName: '',
  onHideCol: noop,
};

export default HeaderGroupRender;
