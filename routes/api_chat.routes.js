const express = require("express");
const router = express.Router();
const { db } = require("../lib/database");
const { savePrivateMessage, fetchChatHistory} = require("../handlers/api_chat.handlers");
const { createChatRoom, getChatList } = require("../handlers/api_chatRoom.handlers");
const { getUserChats, getChatRoom } = require("../handlers/api_chat.handlers");

router.post("/chat/save-message", savePrivateMessage);
router.get("/chat/chat-history/:room_id", fetchChatHistory);
router.post("/chat/create", createChatRoom);
router.get("/chat/chats/:userId", getChatList); // ✅ Cleaner route
router.get("/chat/room-id", getChatRoom); 

module.exports = router;
