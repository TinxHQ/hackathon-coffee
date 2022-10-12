import WDAIntegration from './sdk.js';

export const COFFEE_ENTER = 'COFFEE_ENTER';
export const COFFEE_EXIT = 'COFFEE_EXIT';

WDAIntegration.onLoaded = (session, theme, locale, extra) => {
  console.log('general session', { session, theme, locale, extra });
  WDAIntegration.closeLeftPanel();

  document.getElementById('have-a-sip').addEventListener('click', () => {
    WDAIntegration.startCall({ targets: ['9300'], requestedModalities: ['video'] })
  })

  WDAIntegration._sendMessage(COFFEE_ENTER);
};

WDAIntegration.onUnLoaded = () => {
  WDAIntegration.openLeftPanel();
  WDAIntegration._sendMessage(COFFEE_EXIT);
};

WDAIntegration.initialize();