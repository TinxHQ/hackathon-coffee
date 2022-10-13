import WDAIntegration from './sdk.js';

const CONFERENCE = '9300';

WDAIntegration.onLoaded = async (session, theme, locale, extra) => {
  console.log('coffee - onLoaded', { session, theme, locale, extra });
  WDAIntegration.closeLeftPanel();

  document.getElementById('have-a-sip').addEventListener('click', () => {
    WDAIntegration.startCall({ targets: [CONFERENCE], requestedModalities: ['video'] })
  })

  updateParticipants(session);
};

WDAIntegration.onUnLoaded = () => {
  WDAIntegration.openLeftPanel();
};

WDAIntegration.onWebsocketMessage = message => {
  console.log('coffee - onWebsocketMessage', message);
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

  console.log('coffee - updating participant list', { numParticipants: participants.length });

  if (hasParticipants) {
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
