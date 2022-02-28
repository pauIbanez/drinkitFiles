const requestTypes = {
  toggleTwoDecks: "toggle-two-decks",
  toggleJokers: "toggle-jokers",
  toggleLeftovers: "toggle-leftovers",
  addModifier: "add-modifier",
  removeModifier: "remove-modifier",
  startGame: "start-game",
};

const responseTypes = {
  sendState: "send-state",
  unknownType: "unknown-type",
  startGame: "start-game",
};

module.exports = { requestTypes, responseTypes };
