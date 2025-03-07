define((require) => {
  const scenarioData = require('skbJet/componentManchester/standardIW/scenarioData');
  const gameFlow = require('skbJet/componentManchester/standardIW/gameFlow');
  const audio = require('skbJet/componentManchester/standardIW/audio');
  const gameConfig = require('skbJet/componentManchester/standardIW/gameConfig');
  const gameArea = require('game/components/gameArea');
  const bonusArea = require('game/components/bonus/bonusArea');


  function ticketAcquired() {

    gameArea.populate(scenarioData.scenario);
    bonusArea.populate(scenarioData.scenario);

    //if (!audio.isPlaying('music')) {
    //  audio.fadeIn('music', 0.5, true);
    //}
    if (!audio.isPlaying('music') && gameConfig.backgroundMusicEnabled) {
      audio.fadeIn('music', 0.5, true, 0.35);
    }

    gameFlow.next('START_REVEAL');
  }

  gameFlow.handle(ticketAcquired, 'TICKET_ACQUIRED');
});