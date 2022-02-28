require("dotenv").config();
const crypto = require("crypto");
const PiramideLobbyState = require("./lobbyStates/PiramideLobbyState/PiramideLobbyState");

const getRoomId = () =>
  `${crypto.randomBytes(5).toString("hex")}${Date.now().toString(16)}`;

const lobbyConfig = {
  twoDecks: false,
  jokers: false,
  modifiers: [1, 5],
  leftovers: true,
};

const leader = {
  id: "423452547285432",
  profile: {
    username: "pau678",
  },
};

const id = getRoomId();

const sharedId = crypto.randomBytes(2).toString("hex");

new PiramideLobbyState(lobbyConfig, leader, { id, sharedId });
