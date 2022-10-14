import PortalIntegration from '../sdk/PortalIntegration.js';

const serverCoffee = 'quintana.wazo.community';

PortalIntegration.onLoaded = async (session, stack) => {
  console.log('coffee loaded', stack);

  console.log(session);

  if (stack) {
    const conference = await getConference(serverCoffee);
    console.log(conference);
    const conferences = await getConferences(stack.stack.host, stack.stack.session.token, stack.stack.session.tenantUuid);
    console.log(conferences);

    const saveButton = document.getElementById("save");
    saveButton.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log(e);
      const conferenceId = document.getElementById("rooms").value;
      console.log(conferenceId);
      await saveConference(serverCoffee, conferenceId);
    });
  }
};

PortalIntegration.onUnLoaded = () => {
};

PortalIntegration.initialize();

const getConference = async (url) => {
  const options = {
    method: 'GET',
  }

  return fetch(`https://${url}/hackathon/api/coffee`, options).then(response => response.json());
}

const saveConference = async (url, id) => {
  const data = {
    id: id
  }

  const options = {
    method: 'POST',
    body: JSON.stringify(data)
  }

  return fetch(`https://${url}/hackathon/api/coffee`, options).then(response => response.json());
}

const getConferences = async (url, token, tenant) => {
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
