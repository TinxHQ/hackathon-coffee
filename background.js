import WDAIntegration from './sdk.js';
let tmpColor;


WDAIntegration.onLoaded = (session, theme, locale, extra) => {
  // console.log('background onLoaded', { session, theme, locale, extra });
};

WDAIntegration.onRouteChanged = location => {
  console.log('background onRouteChanged', location.pathname);
  const [element] = document.getElementsByClassName('navbar');
  const collapser = document.querySelector('#collapser > div');

  const atCoffeeMachine = location.pathname.indexOf('coffee-machine') > -1;
  changeToolbarColor(atCoffeeMachine);
};

const changeToolbarColor = atCoffeeMachine => {
  const [element] = document.getElementsByClassName('navbar');
  const collapser = document.querySelector('#collapser > div');

  if (atCoffeeMachine) {
    tmpColor = element.style.backgroundColor;
    const beige = "#8e6a3a";
    element.style.backgroundColor = beige;
    collapser.style.backgroundColor = beige;
    return;
  }

  element.style.backgroundColor = tmpColor;
  collapser.style.backgroundColor = tmpColor;
}


WDAIntegration.onCallIncoming = call => {
  console.log('background onCallIncoming', call);
};

WDAIntegration.onCallAnswered = call => {
  console.log('background onCallAnswered', call);
};

WDAIntegration.onCallMade = call => {
  console.log('background onCallMade', call);
};

WDAIntegration.onCallHangedUp = call => {
  console.log('background onCallHangedUp', call);
};

WDAIntegration.onWebsocketMessage = (message) => {
  console.log(message);
};

WDAIntegration.onUnHandledEvent = event => {
  if (event.data.source !== 'react-devtools-bridge') {
    console.log('unhandled event', event)
  }
}

WDAIntegration.initialize();
