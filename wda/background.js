import app from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@latest/lib/esm/app.js';
import ReconnectingWebSocket from 'https://cdn.jsdelivr.net/npm/reconnecting-websocket@4.4.0/dist/reconnecting-websocket-mjs.js';

const url = 'quintana.wazo.community';

const websocketCoffee = (token) => {
  const ws = new ReconnectingWebSocket(`wss://${url}/hackathon/api/ws`);
  ws.addEventListener('open', (event) => {
    console.log('coffe background - websocket connected');
    ws.send(JSON.stringify({
      "X-Auth-Token": token
    }));
  });
  ws.addEventListener('close', (event) => {
    console.log('coffe background - websocket disconnected');
  });
  ws.addEventListener('message', notificationParticipants);
}

const notificationParticipants = (e) => {
  const data = JSON.parse(e.data);
  if (['conference_participant_left', 'conference_participant_joined'].includes(data.name)) {
    app.sendMessageToIframe({ event: data.name, data: data.data });
    if (data.name === "conference_participant_joined") {
      sendNotificationUser(data.data.caller_id_name);
    }
  }
}

const sendNotificationUser = (name) => {
  if (name === 'Music Bot') { return; }

  const textAlert = `New person on coffee room: ${name}`;
  app.displayNotification("Coffee room", textAlert);
}

app.onAppUnLoaded = (tabId) => {
  // console.log('bg - onAppUnLoaded', tabId);
  app.openLeftPanel();
  app.resetNavBarColor();
}

(async () => {
  // console.log('coffee - background onLoaded');
  await app.initialize();
  const context = app.getContext();
  const token = context.user.token;
  websocketCoffee(token);
})();
