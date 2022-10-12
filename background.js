import WDAIntegration from './sdk.js';
let modal;

const displayCallInformation = call => {
  modal = document.createElement('div');
  modal.style.width = '300px';
  modal.style.height = '400px';
  modal.style.position = 'absolute';
  modal.style.right = '0';
  modal.style.bottom = '0';
  modal.style.padding = '10px';
  modal.style.background = 'white';
  modal.style.border = '1px solid #aaa';
  modal.innerHTML = `<h1>Call with ${call.number}</h1><h2>${call.displayName}</h2>`;

  document.body.appendChild(modal);
};

const hideCallInformation = () => {
  if (!modal) {
    return;
  }
  console.log('modal', modal);
  modal.parentNode.removeChild(modal);
  modal = null;
};


WDAIntegration.onLoaded = (session, theme, locale, extra) => {
  console.log('background onLoaded', { session, theme, locale, extra });

  // displayCallInformation({ number: 123 });
};

WDAIntegration.onRouteChanged = (location, action) => {
  // console.log('background onRouteChanged', { location, action });
};

WDAIntegration.onCallIncoming = call => {
  // console.log('background onCallIncoming', call);
};

WDAIntegration.onCallAnswered = call => {
  displayCallInformation(call)
};

WDAIntegration.onCallMade = call => {
  displayCallInformation(call)
};

WDAIntegration.onCallHangedUp = call => {
  hideCallInformation();
};

WDAIntegration.onWebsocketMessage = (message) => {
    console.log(message);
};

WDAIntegration.initialize();
