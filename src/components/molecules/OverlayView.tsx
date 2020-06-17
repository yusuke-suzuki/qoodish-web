import React from 'react';
import ReactDOM from 'react-dom';

class OverlayView extends React.PureComponent {
  constructor(props) {
    super(props);

    this.position = props.position;
    this.containerDiv = document.createElement('div');
    this.containerDiv.style.position = 'absolute';
    props.googleMapsApi.OverlayView.preventMapHitsAndGesturesFrom(
      this.containerDiv
    );

    const overlayView = new props.googleMapsApi.OverlayView();
    overlayView.onAdd = this.onAdd.bind(this);
    overlayView.draw = this.draw.bind(this);
    overlayView.onRemove = this.onRemove.bind(this);

    overlayView.setMap(props.gMap);

    this.state = {
      overlayView: overlayView
    };
  }

  onAdd() {
    this.state.overlayView
      .getPanes()
      .overlayMouseTarget.appendChild(this.containerDiv);
  }

  onRemove() {
    if (this.containerDiv.parentElement) {
      this.containerDiv.parentElement.removeChild(this.containerDiv);
      ReactDOM.unmountComponentAtNode(this.containerDiv);
      this.containerDiv = null;
    }
  }

  draw() {
    const divPosition = this.state.overlayView
      .getProjection()
      .fromLatLngToDivPixel(this.position);

    // Hide the popup when it is far out of view.
    const display =
      Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
        ? 'block'
        : 'none';

    if (display === 'block') {
      this.containerDiv.style.left = divPosition.x - 40 + 'px';
      this.containerDiv.style.top = divPosition.y - 40 + 'px';
    }
    if (this.containerDiv.style.display !== display) {
      this.containerDiv.style.display = display;
    }

    ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      this.props.children,
      this.containerDiv
    );
    // ReactDOM.createPortal(this.props.children, this.containerDiv);
  }

  render() {
    return false;
  }
}

export default OverlayView;
