import app from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@latest/lib/esm/app.js';

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
  if (name == 'Music Bot') { return; }

  const textAlert = `New person on coffee room: ${name}`;
  app.displayNotification("Coffee room", textAlert);
}

app.onRouteChanged = location => {
  const atCoffeeMachine = location.pathname.indexOf('coffee-machine') > -1;
  changeToolbarColor(atCoffeeMachine);
}

const changeToolbarColor = atCoffeeMachine => {
  if (atCoffeeMachine) {
    app.changeNavBarColor("#8e6a3a");
  } else {
    app.resetNavBarColor();
    app.openLeftPanel();
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
  websocketCoffee();
})();
