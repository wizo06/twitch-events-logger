const { ChatClient } = require("@twurple/chat");
const { db } = require("./firestore.js");
const { listener, apiClient } = require("./twitch.js");
const { Timestamp } = require("firebase-admin/firestore");

const chatClient = new ChatClient({ channels: ["umikoyui"] });

(async () => {
  await chatClient.connect();

  chatClient.onMessage(async (ch, u, message, msg) => {
    const d = new Date(msg.date);
    const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
    const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
    const hour = d.getHours() < 10 ? `0${d.getHours()}` : d.getHours();
    const min = d.getMinutes < 10 ? `0${d.getMinutes()}` : d.getMinutes();
    const sec = d.getSeconds < 10 ? `0${d.getSeconds()}` : d.getSeconds();
    const timestamp = `${d.getFullYear()}.${month}.${date}|${hour}:${min}:${sec}`;

    const user = await apiClient.users.getUserByName(u);
    const channel = await apiClient.users.getUserByName(ch.replace("#", ""));

    console.log(`${timestamp} ${user.name}: ${message}`);

    db.collection("message")
      .doc(msg.id)
      .set({
        timestamp: Timestamp.fromDate(d),
        userId: user.id,
        channelId: channel.id,
        message: message,
      });
  });
})();
