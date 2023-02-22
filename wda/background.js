import app from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@latest/lib/esm/app.js';

const url = 'quintana.wazo.community';

const websocketCoffee = () => {
  const ws = new WebSocket(`wss://${url}/hackathon/api/ws`);
  ws.addEventListener('open', (event) => {
    // console.log('coffe background - websocket connected');
  });
  ws.addEventListener('message', notificationParticipants);
}

const notificationParticipants = (e) => {
  const event = JSON.parse(e.data);
  if (event.name === "conference_participant_joined") {
    sendNotificationUser(event.data.caller_id_name);
  }
}

const sendNotificationUser = (name) => {
  if (name === 'Music Bot') { return; }

  const textAlert = `New person on coffee room: ${name}`;
  app.displayNotification("Coffee room", textAlert);
}

(async () => {
  // console.log('coffee - background onLoaded');
  await app.initialize();
  websocketCoffee();
})();
