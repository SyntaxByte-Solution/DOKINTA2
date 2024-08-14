//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../middleware/checkAccess");


//controller
const ChatTopicController = require("../../controller/user/chatTopic.controller");

//get thumb list of chat between the users
route.get("/get", checkAccessWithSecretKey(), ChatTopicController.getChatList);

//search the users with chat has been done
route.post("/chatWithUserSearch", checkAccessWithSecretKey(), ChatTopicController.chatWithUserSearch);

//get recent chat with user
route.get("/recentChatWithUsers", checkAccessWithSecretKey(), ChatTopicController.recentChatWithUsers);

module.exports = route;
