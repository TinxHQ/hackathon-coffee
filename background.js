import WDAIntegration from './sdk.js';
let tmpColor;


WDAIntegration.onLoaded = (session, theme, locale, extra) => {
  // console.log('background onLoaded', { session, theme, locale, extra });
};

WDAIntegration.onRouteChanged = (location, action) => {
  console.log('background onRouteChanged', { location, action });
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

WDAIntegration.onUnHandledEvent = event => {
  console.log('event', event.data.type)
  const [element] = document.getElementsByClassName('navbar');
  const collapser = document.querySelector('#collapser > div');
  switch (event.data.type) {
    case 'COFFEE_ENTER':
      tmpColor = element.style.backgroundColor;
      const beige = "#8e6a3a";
      element.style.backgroundColor = beige;
      collapser.style.backgroundColor = beige;
      break;
    case 'COFFEE_EXIT':
      element.style.backgroundColor = tmpColor;
      collapser.style.backgroundColor = tmpColor;
      break;
  }
}

WDAIntegration.initialize();
