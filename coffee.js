import WDAIntegration from './sdk.js';

let session;
const CONFERENCE = '9300';

WDAIntegration.onLoaded = async (inboundSession, theme, locale, extra) => {
  session = inboundSession;
  console.log('coffee - onLoaded', { session, theme, locale, extra });
  WDAIntegration.closeLeftPanel();

  updateParticipants(session);
};

WDAIntegration.onUnLoaded = () => {
  WDAIntegration.openLeftPanel();
};

WDAIntegration.onWebsocketMessage = message => {
  switch (message.name) {
    case 'conference_user_participant_joined':
    case 'conference_user_participant_left':
      updateParticipants(session);
      break;
    default:
      console.log('coffee - onWebsocketMessage', message);
  }
};

const getConference = async (url, token, tenant) => {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'X-Auth-Token': token,
      'Wazo-Tenant': tenant
    }
  }

  return fetch(`https://${url}/api/confd/1.1/conferences`, options).then(response => response.json());
}

const getParticipants = async (url, token, tenant, conference_id) => {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'X-Auth-Token': token,
      'Wazo-Tenant': tenant
    }
  }

  return fetch(`https://${url}/api/calld/1.0/conferences/${conference_id}/participants`, options)
    .then(response => response.json())
    .then(response => response.items);
}

const updateParticipants = async session => {
  const loading = document.getElementById('loading');
  loading.style.display = 'block';

  const conferences = await getConference(session.host, session.token, session.tenantUuid);
  const conference_id = conferences.items.find(conf => conf.extensions.some(ext => ext.exten == CONFERENCE)).id;
  const participants = await getParticipants(session.host, session.token, session.tenantUuid, conference_id);

  loading.style.display = 'none';

  const hasParticipants = !!participants.length;
  const table = document.getElementById("members");
  table.style.display = hasParticipants ? 'table' : 'none';

  const emptyRoomMessage = document.getElementById('empty-room');
  emptyRoomMessage.style.display = hasParticipants ? 'none' : 'block';

  const callRoom = () => WDAIntegration.startCall({ targets: [CONFERENCE], requestedModalities: ['video'] });
  const goToRoom = () => WDAIntegration.openLink('/video-conference/25');

  const button = document.getElementById('have-a-sip');
  try {
    button.removeEventListener('click', callRoom);
    button.removeEventListener('click', goToRoom);
  } catch (_) { }

  button.addEventListener('click', hasParticipants ? goToRoom : callRoom)
  button.innerHTML = hasParticipants ? 'Go to room' : 'Have a SIP!';

  console.log('coffee - updating participant list', { numParticipants: participants.length });

  if (hasParticipants) {
    while (table.rows.length > 1) {
      table.deleteRow(table.rows.length - 1);
    }

    participants.forEach(participant => {
      const row = table.insertRow(-1);
      const member = row.insertCell(0);
      const time = row.insertCell(1);
      member.innerHTML = participant.caller_id_name;
      time.innerHTML = "01.00";
    });
  }
}

WDAIntegration.initialize();
