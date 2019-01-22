import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';

const isModifiedEvent = event => {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
};

const Link = props => {
  const mapState = useCallback(
    state => ({
      history: state.shared.history
    }),
    []
  );
  const { history } = useMappedState(mapState);

  const handleClick = useCallback(event => {
    if (props.onClick) props.onClick(event);

    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      (!props.target || props.target === '_self') && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();

      const method = props.replace ? history.replace : history.push;

      method(props.to);
    }
  });

  const { innerRef, replace, to, ...rest } = props;

  return (
    <a
      {...rest}
      onClick={handleClick}
      href={props.to.pathname ? props.to.pathname : props.to}
      ref={innerRef}
    />
  );
};

export default React.memo(Link);
