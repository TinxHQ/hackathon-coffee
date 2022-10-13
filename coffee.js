import WDAIntegration from './sdk.js';

const CONFERENCE = '9300';

WDAIntegration.onLoaded = async (session, theme, locale, extra) => {
  console.log('general session', { session, theme, locale, extra });
  WDAIntegration.closeLeftPanel();

  document.getElementById('have-a-sip').addEventListener('click', () => {
    WDAIntegration.startCall({ targets: [CONFERENCE], requestedModalities: ['video'] })
  })

  updateParticipants(session);
};

WDAIntegration.onUnLoaded = () => {
  WDAIntegration.openLeftPanel();
};

WDAIntegration.onRouteChanged = location => {
  console.log('background onRouteChanged', location.pathname);

  const atCoffeeMachine = location.pathname.indexOf('coffee-machine') > -1;

  // @FIXME: this is called on every route change; restrict to entering/exiting coffee-machine
  try {
    changeToolbarColor(atCoffeeMachine);
  } catch (_) {
    // do nothing
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

  console.log('updating participant list', { numParticipants: participants.length });

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

WDAIntegration.initialize();
