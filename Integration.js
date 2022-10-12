const EVENT_CLOSE_LEFT_PANEL = 'wazo/EVENT_CLOSE_LEFT_PANEL';
const EVENT_OPEN_LEFT_PANEL = 'wazo/EVENT_OPEN_LEFT_PANEL';

class Integration {
  onUnLoaded() {};

  initialize() {
    window.addEventListener('beforeunload', this.onUnLoaded);
    window.addEventListener('unload', this.onUnLoaded);
  }

  closeLeftPanel() {
    this._sendMessage(EVENT_CLOSE_LEFT_PANEL);
  }

  openLeftPanel() {
    this._sendMessage(EVENT_OPEN_LEFT_PANEL);
  }

  _sendMessage = (type, payload  = {}) => {
    window.parent.postMessage({ type, ...payload }, '*');
  }
}

export default Integration;
