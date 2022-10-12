import WDAIntegration from './sdk.js';

WDAIntegration.onLoaded = (session, theme, locale, extra) => {
  console.log('general session', { session, theme, locale, extra });
  WDAIntegration.closeLeftPanel();

  document.getElementById('have-a-sip').addEventListener('click', () => {
    console.log('test');
    WDAIntegration.startCall({ targets: ['9300'], requestedModalities: ['video'] })
  })
};

WDAIntegration.onUnLoaded = () => {
  WDAIntegration.openLeftPanel();
};

WDAIntegration.initialize();