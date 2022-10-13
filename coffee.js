import WDAIntegration from './sdk.js';

const CONFERENCE = '9300';

WDAIntegration.onLoaded = async (session, theme, locale, extra) => {
  console.log('general session', { session, theme, locale, extra });
  WDAIntegration.closeLeftPanel();

  document.getElementById('have-a-sip').addEventListener('click', () => {
    WDAIntegration.startCall({ targets: [CONFERENCE], requestedModalities: ['video'] })
  })

  const conferences = await getConference(session.host, session.token, session.tenantUuid);
  const conference_id = conferences.items.find(conf => conf.extensions.some(ext => ext.exten == CONFERENCE)).id;
  const participants = await getParticipants(session.host, session.token, session.tenantUuid, conference_id);
  const table = document.getElementById("members");
  participants.items.forEach(participant => {
    const row = table.insertRow(-1);
    const member = row.insertCell(0);
    const time = row.insertCell(1);
    member.innerHTML = participant.caller_id_name;
    time.innerHTML = "01.00";
  });
};

WDAIntegration.onUnLoaded = () => {
  WDAIntegration.openLeftPanel();
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

  return fetch(`https://${url}/api/calld/1.0/conferences/${conference_id}/participants`, options).then(response => response.json());
}

WDAIntegration.initialize();
