class PiramideState {

leader;

players = {
  connectedPlayers = [],
  disconnectedPlayers = [],
};

minPlayers;
maxPlayers;
availableSlots;

twoDecks;
jokers;
leftovers;
modifiers = [];


allCards = [];



  constructor(roomConfig, leader, players) {
    this.leader = leader;

    this.players.connectedPlayers.push(leader);
    players.forEach(player => {
       this.players.connectedPlayers.push(player)
    });

    this.setupRoom(roomConfig);
  };

  setupRoom(roomConfig){
    this.minPlayers = roomConfig.twoDecks ? 7 : 4;
    this.maxPlayers = roomConfig.twoDecks ? 12 : 7;

    this.twoDecks = roomConfig.twoDecks;
    this.jokers = roomConfig.jokers;
    this.modifiers = roomConfig.modifiers;

  }


}
