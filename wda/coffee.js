import app from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@latest/lib/esm/app.js';

let session;
let ws;
let timeCheck;
let playing;
let volume = 9;
const timers = {};
const appColor = '#8e6a3a';

const url = 'quintana.wazo.community';

app.onIframeMessage = (msg) => {
  if (['conference_participant_left', 'conference_participant_joined'].includes(msg.event)) {
    updateParticipants();
  }
}

const getConference = async () => {
  const options = {
    method: 'GET',
  }

  return fetch(`https://${url}/hackathon/api/coffee`, options).then(response => response.json());
}

const getParticipants = async () => {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    }
  }

  return fetch(`https://${url}/hackathon/api/participants`, options)
    .then(response => response.json())
    .then(response => response.items);
}

const updateMediaState = () => {
  const icon = document.querySelector('#media > a > img');
  icon.src = playing ? 'pause.png' : 'play.png';

  // let's show/hide volume buttons based on state
  const volumeButtons = document.querySelector('#volume');
  volumeButtons.style.display = playing ? 'flex' : 'none';
}

const updateVolumeButtonStates = () => {
  const volumeUp = document.querySelector('#volume #up');
  const volumeDown = document.querySelector('#volume #down');
  const volumeValue = document.querySelector('#volume #value');

  volumeUp.className = '';
  volumeDown.className = '';
  volumeValue.innerHTML = volume;

  if (volume >= 10) {
    volumeUp.className = 'disabled';
  }

  if (volume <= 1) {
    volumeDown.className = 'disabled';
  }
}

const setVolume = async up => {
  if (up && volume >= 10) {
    return;
  }

  if (!up && volume <= 1) {
    return;
  }

  try {
    const newVolume = volume + (up ? 1 : -1);

    const options = {
      method: 'POST',
      body: JSON.stringify({ volume: newVolume }),
    }
    await fetch(`https://${url}/hackathon/api/moh/volume`, options);

    volume = newVolume;

    updateVolumeButtonStates();
  } catch (e) {
    console.log('coffee - error setting volume', e)
  }

}

const setupMedia = () => {
  const player = document.querySelector('#media > a');

  player.addEventListener('click', async () => {
    try {
      const options = {
        method: 'POST',
      }
      await fetch(`https://${url}/hackathon/api/moh/${playing ? 'stop' : 'play'}`, options);
      playing = !playing;
      updateMediaState();
    } catch (e) {
      console.log('coffee - error setting media', e);
    }
  });

  const volumeUp = document.querySelector('#volume #up');
  const volumeDown = document.querySelector('#volume #down');

  volumeUp.addEventListener('click', () => setVolume(true));
  volumeDown.addEventListener('click', () => setVolume(false));

  // this should set the volume to 10 -- i know, a little lame
  setVolume(true);
}

const setMediaVisibility = show => {
  const media = document.querySelector('#media');
  media.style.display = show ? 'flex' : 'none';
}

const timeFormat = duration => {
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}

const updateTimers = () => {
  const now = Date.now();
  Object.keys(timers).forEach(callId => {
    const time = document.querySelector(`tr#row-${callId.replace('.', '-')} td.time`);
    const date = timers[callId];
    time.innerHTML = `${timeFormat((now - date.getTime()) / 1000)}`;
  })
}

const updateParticipants = async () => {
  const loading = document.getElementById('loading');
  loading.style.display = 'block';

  let hasParticipants = false;

  const conference = await getConference();
  const conference_id = conference.id;
  const conference_exten = conference.exten;
  const participants = await getParticipants();
  hasParticipants = !!participants.length;

  loading.style.display = 'none';

  const table = document.getElementById("members");
  table.style.display = hasParticipants ? 'table' : 'none';

  const emptyRoomMessage = document.getElementById('empty-room');
  emptyRoomMessage.style.display = hasParticipants ? 'none' : 'block';

  const callRoom = () => app.startCall({ targets: [conference_exten], requestedModalities: ['video'] });
  const goToRoom = () => app.openLink(`/video-conference/${conference_id}`);

  const button = document.getElementById('have-a-sip');

  try {
    button.removeEventListener('click', callRoom);
    button.removeEventListener('click', goToRoom);
  } catch (_) { }

  const userIsInRoom = participants.some(({ caller_id_name: name }) => name === session.profile.firstName);

  button.addEventListener('click', userIsInRoom ? goToRoom : callRoom)
  button.innerHTML = userIsInRoom ? 'Go to room' : 'Have a SIP!';

  if (hasParticipants) {
    const now = Date.now();

    while (table.rows.length > 1) {
      table.deleteRow(table.rows.length - 1);
    }

    participants.forEach(participant => {
      const { call_id: callId, caller_id_name: name, join_time: joinTime } = participant;
      // let's initiate timers
      if (!timers[callId]) {
        timers[callId] = new Date(now - (+joinTime * 1000));
      }

      const row = table.insertRow(-1);
      row.id = `row-${callId.replace('.', '-')}`;
      const member = row.insertCell(0);
      member.innerHTML = name;
      const time = row.insertCell(1);
      time.className = 'time';
    });


    // let's remove unused timers
    Object.keys(timers).forEach(callId => {
      const participantExists = participants.some(p => p.call_id === callId);

      if (!participantExists) {
        delete timers[callId];
      }
    });

    if (!timeCheck) {
      timeCheck = setInterval(updateTimers, 1000);
      updateTimers();
    }

    setMediaVisibility(true);

    // check if music bot is already present
    playing = participants.some(p => p.caller_id_name === 'Music Bot');
    updateMediaState();


    return;
  }

  if (timeCheck) {
    clearInterval(timeCheck);
  }

  setMediaVisibility(false);
}

const appLoaded = () => {
  const data = { type: 'coffee/APP_LOADED' };
  window.top.postMessage(data, '*')
}

(async () => {
  await app.initialize();
  const context = app.getContext();
  session = context.user;

  app.closeLeftPanel();
  app.changeNavBarColor(appColor);

  updateParticipants();
  setupMedia();
  appLoaded();
})();
