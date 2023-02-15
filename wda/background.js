import app from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@latest/lib/esm/app.js';

const url = 'quintana.wazo.community';
const appColor = '#8e6a3a';

const websocketCoffee = () => {
  const ws = new WebSocket(`wss://${url}/hackathon/api/ws`);
  ws.addEventListener('open', (event) => {
    console.log('coffe background - websocket connected');
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
    app.changeNavBarColor(appColor);
  } else {
    app.resetNavBarColor();
    app.openLeftPanel();
  }
}

window.onmessage = (e) => {
  // Wait for fix in unloaded in the sdk
  switch (e.data?.type) {
    case "coffee/APP_LOADED":
      //app.changeNavBarColor(appColor);
      changeToolbarColor(true);
      break;
    case "coffee/APP_UNLOADED":
      //app.resetNavBarColor();
      //app.openLeftPanel();
      changeToolbarColor(false);
      break;
  }
}

(async () => {
  console.log('coffee - background onLoaded');
  await app.initialize();
  websocketCoffee();
})();
