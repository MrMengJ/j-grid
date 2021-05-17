import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import elementResizeDetectorMaker from 'element-resize-detector';
import PropTypes from 'prop-types';
import { compact, findIndex, isArray, isEmpty, map, noop } from 'lodash';
import classNames from 'classnames';

import { getPrimaryColor } from '../../utils/style';

import Tab from './Tab';
import { TabTitle } from './TabTitle';

const Wrapper = styled.div`
  overflow-x: hidden;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 1.5;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
`;

const NavWrap = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: ${(props) => (props.scrollable ? `0 32px` : 0)};
`;

const Indicator = styled.div`
  height: 2px;
  background-color: ${(props) => getPrimaryColor(props.theme)};
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 1;
  transition: transform 0.3s ease-in-out;
  transform-origin: 0 0;
`;
const NavPrev = styled.span`
  display: ${(props) => (props.scrollable ? `inline-block` : `none`)};
  width: 32px;
  text-align: center;
  position: absolute;
  cursor: pointer;
  left: 0;
  &:hover {
    svg {
      fill: ${(props) => getPrimaryColor(props.theme)};
    }
  }
`;

const NavNext = styled.span`
  display: ${(props) => (props.scrollable ? `inline-block` : `none`)};
  width: 32px;
  text-align: center;
  position: absolute;
  line-height: 45px;
  cursor: pointer;
  right: 0;
  &:hover {
    svg {
      fill: ${(props) => getPrimaryColor(props.theme)};
    }
  }
`;

const NavScroll = styled.div`
  overflow: hidden;
  width: ${(props) => props.width}px;
  flex-grow: 1;
`;

const Nav = styled.div`
  position: relative;
  padding-left: 0;
  margin: 0;
  float: left;
  list-style: none;
  transition: transform 0.5s ease-in-out;
`;

const Panel = styled.div`
  width: 100%;
  flex-shrink: 0;
`;

const PanelWrapper = styled.div`
  display: flex;
  margin-top: 10px;
  transition: ${(props) => (props.animated ? `transform 0.3s ease-in-out` : 'none')};
`;

const Extra = styled.div`
  margin-left: 10px;
`;

const isElementOfType = (element, ComponentType) => {
  return (
    element != null &&
    element.type != null &&
    element.type.displayName != null &&
    element.type.displayName === ComponentType.displayName
  );
};

const isTabElement = (child) => {
  return isElementOfType(child, Tab);
};

function Tabs(props) {
  const {
    className,
    style,
    extra,
    children,
    renderActiveTabPanelOnly,
    animated,
    onChange,
    theme,
    panelStyle,
    navWidth,
  } = props;
  const [selectedId, setSelectedId] = useState(props.selectedId);
  const [scrollable, setScrollable] = useState(false);
  const [navStyle, setNavStyle] = useState({ transform: '' });
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navWrapRef = useRef(null);
  const navScrollRef = useRef(null);
  const navRef = useRef(null);
  useEffect(() => {
    setSelectedId(props.selectedId);
  }, [props.selectedId]);

  const renderTab = (children) => {
    if (isArray(children)) {
      return map(children, renderTabTitle);
    } else {
      return renderTabTitle(children);
    }
  };

  const renderTabTitle = (child) => {
    if (isTabElement(child)) {
      const { id } = child.props;
      return (
        <TabTitle
          key={id}
          theme={theme}
          {...child.props}
          onClick={handleTabClick}
          selected={id === selectedId}
        />
      );
    }
    return child;
  };

  const getTabChildren = ({ children } = props) => {
    const result = isArray(children) ? children : [children];
    return result.filter(isTabElement);
  };

  const getPanelStyle = (selectedId, panelStyle, renderActiveTabPanelOnly) => {
    const tabChildren = getTabChildren();
    const allTabId = map(tabChildren, (item) => {
      return item.props.id;
    });
    const activeIndex = findIndex(allTabId, (item) => item === selectedId);
    const transform =
      renderActiveTabPanelOnly || activeIndex < 1
        ? `translateX(0)`
        : `translateX(-${activeIndex}00%)`;
    return { transform, ...panelStyle };
  };

  const renderTabPanel = (tab) => {
    const { panel, id, panelClassName } = tab.props;
    if (panel === undefined) {
      return undefined;
    }
    return (
      <Panel className={classNames(panelClassName)} key={id}>
        {panel}
      </Panel>
    );
  };

  const tabPanels = getTabChildren()
    .filter(renderActiveTabPanelOnly ? (tab) => tab.props.id === selectedId : () => true)
    .map(renderTabPanel);

  const handleTabClick = (id, event) => {
    setSelectedId(id);
    onChange(id, event);
  };

  const scrollPrev = () => {
    const containerWidth = navScrollRef.current.offsetWidth;
    const currentOffset = getCurrentScrollOffset();
    if (!currentOffset) return;

    let newOffset = currentOffset > containerWidth ? currentOffset - containerWidth : 0;

    setOffset(newOffset);
    moveSelectionIndicator();
  };

  const scrollNext = () => {
    const navWidth = navRef.current.offsetWidth;
    const containerWidth = navScrollRef.current.offsetWidth;
    const currentOffset = getCurrentScrollOffset();
    if (navWidth - currentOffset <= containerWidth) return;

    let newOffset =
      navWidth - currentOffset > containerWidth * 2
        ? currentOffset + containerWidth
        : navWidth - containerWidth;

    setOffset(newOffset);
    moveSelectionIndicator();
  };

  const getCurrentScrollOffset = () => {
    return navStyle.transform
      ? Number(navStyle.transform.match(/translateX\(-(\d+(\.\d+)*)px\)/)[1])
      : 0;
  };

  const setOffset = (value) => {
    setNavStyle({ transform: `translateX(-${value}px)` });
  };

  const updateNavScroll = () => {
    const navWidth = navRef.current.offsetWidth;
    const containerWidth = navScrollRef.current.offsetWidth;
    const currentOffset = getCurrentScrollOffset();
    if (containerWidth < navWidth) {
      setScrollable(true);
      if (navWidth - currentOffset < containerWidth) {
        setOffset(navWidth - containerWidth);
      }
    } else {
      setScrollable(false);
      if (currentOffset > 0) {
        setOffset(0);
      }
    }
  };

  const handleResize = () => {
    updateNavScroll();
  };

  const moveSelectionIndicator = () => {
    const tabIdSelector = `*[data-tab-id="${selectedId}"]`;
    const selectedTabElement = navScrollRef.current.querySelector(tabIdSelector);
    let indicatorStyle = { display: 'none' };
    if (selectedTabElement) {
      const { clientWidth, offsetLeft } = selectedTabElement;
      indicatorStyle = {
        display: 'block',
        transform: `translateX(${Math.floor(offsetLeft)}px)`,
        width: clientWidth,
      };
    }
    setIndicatorStyle(indicatorStyle);
  };

  const scrollToActiveTab = () => {
    if (!scrollable) return;
    const nav = navRef.current;
    const navScroll = navScrollRef.current;
    const tabIdSelector = `*[data-tab-id="${selectedId}"]`;
    const activeTab = navScroll.querySelector(tabIdSelector);

    if (!activeTab) return;

    const activeTabBounding = activeTab.getBoundingClientRect();
    const navScrollBounding = navScroll.getBoundingClientRect();
    const navBounding = nav.getBoundingClientRect();
    const currentOffset = getCurrentScrollOffset();
    let newOffset = currentOffset;

    if (navBounding.right < navScrollBounding.right) {
      newOffset = nav.offsetWidth - navScrollBounding.width;
    }

    if (activeTabBounding.left < navScrollBounding.left) {
      newOffset = currentOffset - (navScrollBounding.left - activeTabBounding.left);
    } else if (activeTabBounding.right > navScrollBounding.right) {
      newOffset = currentOffset + activeTabBounding.right - navScrollBounding.right;
    }

    if (currentOffset !== newOffset) {
      setOffset(Math.max(newOffset, 0));
    }
  };

  useEffect(
    () => {
      moveSelectionIndicator();
      updateNavScroll();
      const navWrapperElement = navWrapRef.current;
      const observer = elementResizeDetectorMaker();
      observer.listenTo(navWrapperElement, handleResize);
      return () => {
        observer.removeListener(navWrapperElement, handleResize);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    updateNavScroll();
  }, [children]);

  useEffect(
    () => {
      moveSelectionIndicator();
      scrollToActiveTab();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedId, scrollable]
  );
  return (
    <Wrapper className={className} style={style}>
      <Container>
        <NavWrap ref={navWrapRef} scrollable={scrollable}>
          <NavPrev theme={theme} onClick={scrollPrev} scrollable={scrollable}>
            <Icon icon={IconNames.CHEVRON_LEFT} iconSize={18} />
          </NavPrev>
          <NavNext theme={theme} onClick={scrollNext} scrollable={scrollable}>
            <Icon icon={IconNames.CHEVRON_RIGHT} iconSize={18} />
          </NavNext>
          <NavScroll ref={navScrollRef} width={navWidth}>
            <Nav ref={navRef} style={navStyle}>
              <Indicator theme={theme} style={indicatorStyle} />
              {renderTab(children)}
            </Nav>
          </NavScroll>
        </NavWrap>
        {extra && <Extra>{extra}</Extra>}
      </Container>
      {!isEmpty(compact(tabPanels)) && (
        <PanelWrapper
          animated={animated}
          style={getPanelStyle(selectedId, panelStyle, renderActiveTabPanelOnly)}
        >
          {tabPanels}
        </PanelWrapper>
      )}
    </Wrapper>
  );
}

Tabs.propTypes = {
  selectedId: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.string,
  renderActiveTabPanelOnly: PropTypes.bool,
  animated: PropTypes.bool,
  onChange: PropTypes.func,
  extra: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  children: PropTypes.node,
};

Tabs.defaultProps = {
  onChange: noop,
  renderActiveTabPanelOnly: false,
  animated: false,
  style: {},
};

export default Tabs;
