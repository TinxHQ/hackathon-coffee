import WDAIntegration from './sdk.js';
let tmpColor;


WDAIntegration.onLoaded = (session, theme, locale, extra) => {
  // console.log('background onLoaded', { session, theme, locale, extra });
};

WDAIntegration.onRouteChanged = location => {
  console.log('background onRouteChanged', location.pathname);
  const [element] = document.getElementsByClassName('navbar');
  const collapser = document.querySelector('#collapser > div');

  if (location.pathname.indexOf('coffee-machine') > -1) {
    tmpColor = element.style.backgroundColor;
    const beige = "#8e6a3a";
    element.style.backgroundColor = beige;
    collapser.style.backgroundColor = beige;
    console.log('beige')
  } else {
    element.style.backgroundColor = tmpColor;
    collapser.style.backgroundColor = tmpColor;
    console.log('blue')
  }
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
  console.log('unhandled event', event.data.type)
}

WDAIntegration.initialize();
