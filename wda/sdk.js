import Integration, { EVENT_CLOSE_LEFT_PANEL, EVENT_OPEN_LEFT_PANEL } from "./Integration.js";

const EVENT_ON_LOADED = 'wazo/ON_LOADED';
const EVENT_START_CALL = 'wazo/START_CALL';
const EVENT_ON_CALL_INCOMING = 'wazo/EVENT_ON_CALL_INCOMING';
const EVENT_ON_CALL_MADE = 'wazo/EVENT_ON_CALL_MADE';
const EVENT_ON_CALL_ANSWERED = 'wazo/EVENT_ON_CALL_ANSWERED';
const EVENT_ON_CALL_HANGED_UP = 'wazo/EVENT_ON_CALL_HANGED_UP';
const EVENT_OPEN_LINK = 'wazo/EVENT_OPEN_LINK';
const EVENT_CREATE_MEETING = 'wazo/EVENT_CREATE_MEETING';
const EVENT_OPEN_MEETING_LOBBY = 'wazo/EVENT_OPEN_MEETING_LOBBY';
const EVENT_OPEN_SETTINGS = 'wazo/EVENT_OPEN_SETTINGS';
const EVENT_ON_MEETING_CREATED = 'wazo/EVENT_ON_MEETING_CREATED';
const EVENT_ROUTE_CHANGE = 'wazo/EVENT_ROUTE_CHANGE';
const EVENT_ON_LOGOUT = 'wazo/EVENT_ON_LOGOUT';

const EVENT_WS_MESSAGE = 'wazo/EVENT_WS_MESSAGE';

class WDAIntegration extends Integration {
  onLoaded = (session, theme, locale, extra) => { }
  onLogout = () => { }
  onCallIncoming = (call) => { }
  onCallMade = (call) => { }
  onCallAnswered = (call) => { }
  onCallHangedUp = (call) => { }
  onUnHandledEvent = (event) => { }
  onWebsocketMessage = (message) => { }
  onRouteChanged = (message) => { }

  initialize() {
    super.initialize();
    window.addEventListener('message', this._onMessage, false);
  }

  startCall({ targets, requestedModalities = ['audio'] }) {
    this._sendMessage(EVENT_START_CALL, { targets, requestedModalities });
  }

  openLink(url) {
    this._sendMessage(EVENT_OPEN_LINK, { url });
  }

  createMeeting(name, requireAuthorization = false, persistent = false) {
    this._sendMessage(EVENT_CREATE_MEETING, { name, requireAuthorization, persistent });
  }

  openMeetingLobby(number) {
    this._sendMessage(EVENT_OPEN_MEETING_LOBBY, { number });
  }

  openSettings() {
    this._sendMessage(EVENT_OPEN_SETTINGS);
  }

  _onMessage = event => {
    if (!event.data) {
      return;
    }

    switch (event.data.type) {
      case EVENT_ON_LOADED:
        this.onLoaded(event.data.session, event.data.theme, event.data.locale, event.data.extra);
        break;
      case EVENT_WS_MESSAGE:
        this.onWebsocketMessage(event.data.message);
        break;
      case EVENT_ON_MEETING_CREATED:
        this.onMeetingCreated(event.data.meeting);
        break;
      case EVENT_ROUTE_CHANGE:
        this.onRouteChanged(event.data.location, event.data.action);
        break;
      case EVENT_ON_CALL_INCOMING:
        this.onCallIncoming(event.data.call);
        break;
      case EVENT_ON_CALL_MADE:
        this.onCallMade(event.data.call);
        break;
      case EVENT_ON_CALL_ANSWERED:
        this.onCallAnswered(event.data.call);
        break;
      case EVENT_ON_CALL_HANGED_UP:
        this.onCallHangedUp(event.data.call);
        break;
      case EVENT_ON_LOGOUT:
        this.onLogout();
        break;
      case EVENT_CLOSE_LEFT_PANEL:
      case EVENT_OPEN_LEFT_PANEL:
        // prevent these two events from ending up in onUnHandledEvent
        break;
      default:
        this.onUnHandledEvent(event);
        break;
    }
  }
}

export default new WDAIntegration();
