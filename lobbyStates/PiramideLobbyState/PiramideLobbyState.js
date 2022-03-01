const debug = require("debug")("drinkit:piramide lobby state");
const chalk = require("chalk");
const { requestTypes, responseTypes } = require("./messageTypes");

// ALL WS METHODES IN THIS CLASS ASUME THE REQUEST IS VALIDATED AND PARSED BEFORE BEING CALLED
class PiramideLobbyState {
  ready = false;

  id;
  sharedId;

  leader;
  connectedPlayers = [];

  // Player:
  // {
  //   profile: {},
  //   id: "",
  //   connection
  // }

  minPlayers;
  maxPlayers;
  availableSlots;

  twoDecks;
  jokers;
  leftovers;
  modifiers = [];

  constructor(lobbyConfig, leader, reference) {
    this.id = reference.id;
    this.sharedId = reference.sharedId;
    this.leader = leader;
    this.connectedPlayers.push(leader);

    this.setupLobby(lobbyConfig);
  }

  setupLobby(lobbyConfig) {
    if (this.ready) {
      throw new Error("Lobby is already set up!");
    }

    this.minPlayers = lobbyConfig.twoDecks ? 7 : 4;
    this.maxPlayers = lobbyConfig.twoDecks ? 12 : 7;
    this.availableSlots = this.maxPlayers - this.connectedPlayers.length;

    this.jokers = lobbyConfig.jokers;
    this.twoDecks = lobbyConfig.twoDecks;
    this.leftovers = lobbyConfig.leftovers;
    this.modifiers = lobbyConfig.modifiers;
    this.ready = true;

    debug(
      chalk.yellowBright(
        `Lobby created by ${this.leader.profile.username} | ID: ${this.sharedId} - ${this.id}`
      )
    );
  }

  appendPlayer(player) {
    this.connectedPlayers.push(player);
    debug(
      chalk.yellowBright(
        `Player ${this.leader.profile.username} joined lobby ${this.id}`
      )
    );
    this.sendMessage({ type: responseTypes.updateState });
  }

  removePlayer(id) {
    const player = this.connectedPlayers.find((player) => player.id === id);

    if (player.id === this.leader.id) {
      const newLeader = this.getNewLeader();
      this.leader = newLeader;
      this.sendMessage({ type: responseTypes.updateLeader });
    }

    this.connectedPlayers = this.connectedPlayers.filter(
      (player) => player.id !== id
    );
    debug(
      chalk.yellowBright(`Player ${player.username} left lobby ${this.id}`)
    );
    this.sendMessage({ type: responseTypes.updateState });
  }

  toggleDecks() {
    this.twoDecks = !this.twoDecks;
  }

  toggleJokers() {
    this.jokers = !this.jokers;
  }

  toggleLeftovers() {
    this.leftovers = !this.leftovers;
  }

  addModifier(modifierId) {
    if (this.modifiers.includes(modifierId)) {
      throw new Error("Lobby already contains this modifier");
    }

    this.modifiers.push(modifierId);
  }

  getNewLeader() {
    return this.connectedPlayers.find((player) => player.id !== this.leader.id);
  }

  formatPlayer(player) {
    return {
      id: player.id,
      profile: player.profile,
    };
  }

  getState() {
    const players = this.connectedPlayers.map((player) =>
      this.formatPlayer(player)
    );
    const leader = this.formatPlayer(this.leader);

    return {
      leader: leader,
      connectedPlayers: players,

      minPlayers: this.minPlayers,
      maxPlayers: this.maxPlayers,

      twoDecks: this.twoDecks,
      jokers: this.jokers,
      leftovers: this.leftovers,
      modifiers: this.modifiers,
    };
  }

  removeModifier(modifierId) {
    if (!this.modifiers.includes(modifierId)) {
      throw new Error("Cannot remove missing modifier");
    }

    this.modifiers = this.modifiers.filter(
      (modifier) => modifier !== modifierId
    );
  }

  recieveMessage(request) {
    switch (request.type) {
      case requestTypes.toggleTwoDecks:
        this.toggleTwoDecks();
        break;

      case requestTypes.toggleJokers:
        this.toggleJokers();
        break;

      case requestTypes.toggleLeftovers:
        this.toggleLeftovers();
        break;

      case requestTypes.addModifier:
        this.addModifier(request.modifierId);
        break;

      case requestTypes.removeModifier:
        this.removeModifier(request.modifierId);
        break;
      default:
        this.sendMessage({
          requester: request.clientId,
          type: responseTypes.unknownType,
        });
        return;
    }

    this.sendMessage({ type: responseTypes.updateState });
  }

  sendMessage(message) {
    switch (message.type) {
      case responseTypes.updateState:
        const payload = {
          type: responseTypes.updateState,
          state: this.getState(),
        };

        this.connectedPlayers.forEach(({ connection }) => {
          connection.send(JSON.stringify(payload));
        });
        break;

      case responseTypes.updateLeader:
        const payload = {
          type: responseTypes.updateLeader,
          leader: this.leader.id,
        };
        this.connectedPlayers[message.requester].send(JSON.stringify(payload));
        break;

      case responseTypes.unknownType:
        const payload = {
          type: responseTypes.unknownType,
          error: "Wee, might drop connection",
        };
        this.connectedPlayers[message.requester].send(JSON.stringify(payload));
        break;

      default:
        debug(
          chalk.redBright(
            `An error has occured in room ${this.id}: Unknown response type`
          )
        );
        break;
    }
  }
}

module.exports = PiramideLobbyState;
