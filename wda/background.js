import app from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@latest/lib/esm/app.js';

let tmpColor;
let ws;

const url = 'quintana.wazo.community';

const websocketCoffee = () => {
  ws = new WebSocket(`wss://${url}/hackathon/api/ws`);
  ws.addEventListener('open', (event) => {
    console.log('background - websocket connected');
  });
  ws.addEventListener('message', notificationParticipants);
}

const notificationParticipants = (e) => {
  const event = JSON.parse(e.data);
  if (event.name == "conference_participant_joined") {
    sendNotificationUser(event.data.caller_id_name);
  }
}

const sendNotificationUser = (name) => {
  const textAlert = `New person on coffee room: ${name}`;
  if (name == 'Music Bot') { return; }
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf(' electron/') > -1) {
    const { Notification } = require('electron');
    new Notification({ title: "Coffee room", body: textAlert }).show()
  } else {
    new Notification(textAlert);
  }
}

app.onRouteChanged = location => {
  console.log('background onRouteChanged', location.pathname);
  const [element] = document.getElementsByClassName('navbar');

  const atCoffeeMachine = location.pathname.indexOf('coffee-machine') > -1;
  changeToolbarColor(atCoffeeMachine);
}

const changeToolbarColor = atCoffeeMachine => {
  const [element] = document.getElementsByClassName('navbar');
  const collapser = document.querySelector('[data-testid="collapser"] > div')

  if (atCoffeeMachine) {
    console.log('Coffee - Apply coffee color');
    const beige = "#8e6a3a";
    element.style.backgroundColor = beige;
    collapser.style.backgroundColor = beige;
    return;
  }

  console.log('Coffee - Revert coffee color');
  element.style.backgroundColor = tmpColor;
  collapser.style.backgroundColor = tmpColor;
  app.openLeftPanel();
}

app.onCallIncoming = call => {
  console.log('background onCallIncoming', call);
}

app.onCallAnswered = call => {
  console.log('background onCallAnswered', call);
}

app.onCallMade = call => {
  console.log('background onCallMade', call);
}

app.onCallHangedUp = call => {
  console.log('background onCallHangedUp', call);
}

app.onWebsocketMessage = (message) => {
  console.log(message);
}

app.onUnHandledEvent = event => {
  if (event.data.source !== 'react-devtools-bridge') {
    console.log('unhandled event', event);
  }
}

window.onmessage = (e) => {
  switch (e.data?.type) {
    case "coffee/APP_LOADED":
      changeToolbarColor(true);
      break;
    case "coffee/APP_UNLOADED":
      // Wait for fix in unloaded in the sdk
      changeToolbarColor(false);
      break;
  }
}

(async () => {
  await app.initialize();
  const context = app.getContext();
  const session = context.user;
  console.log('coffee - background onLoaded', context);

  if (!tmpColor) {
    const [element] = document.getElementsByClassName('navbar');
    tmpColor = element.style.backgroundColor;
    console.log(tmpColor);
  }

  websocketCoffee();
})();
