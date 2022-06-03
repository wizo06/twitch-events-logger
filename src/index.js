const { ChatClient } = require("@twurple/chat");
const { db } = require("./firestore.js");
const { listener, apiClient } = require("./twitch.js");
const { Timestamp } = require("firebase-admin/firestore");

const chatClient = new ChatClient({ channels: ["umikoyui"] });

const formatTimestamp = (x) => {
  const d = new Date(x);
  const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
  const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
  const hour = d.getHours() < 10 ? `0${d.getHours()}` : d.getHours();
  const min = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
  const sec = d.getSeconds() < 10 ? `0${d.getSeconds()}` : d.getSeconds();
  const timestamp = `${d.getFullYear()}.${month}.${date}|${hour}:${min}:${sec}`;

  return timestamp;
};

const getUserId = async (u) => {
  const userSnapshot = await db.collection("users").where("name", "==", u).get();
  if (userSnapshot.empty) {
    const user = await apiClient.users.getUserByName(u);
    await db.collection("users").doc(user.id).set({
      name: user.name,
      creationDate: user.creationDate,
      displayName: user.displayName,
      profilePictureUrl: user.profilePictureUrl,
    });
    return user.id;
  }

  return userSnapshot.docs[0].id;
};

(async () => {
  await chatClient.connect();

  chatClient.onAction(async (ch, u, message, msg) => {
    const timestamp = formatTimestamp(msg.date);

    const userId = await getUserId(u);
    const channelId = await getUserId(ch.replace("#", ""));

    console.log(`${timestamp} ${u}: ${message}`);

    await db
      .collection("action")
      .doc(msg.id)
      .set({
        timestamp: Timestamp.fromDate(msg.date),
        userId,
        channelId,
        message: message,
      });
  });

  // Not implemented yet
  // chatClient.onAnnouncement(async (ch, u, announcementInfo, msg) => {
  //   const timestamp = formatTimestamp(msg.date);
  //   const userId = await getUserId(u);
  //   const channelId = await getUserId(ch.replace("#", ""));
  //   console.log(`${timestamp} ${u}: ${msg.message}`);
  //   console.log(announcementInfo);
  // })

  // Not fully implemented yet
  chatClient.onBan(async (ch, u, msg) => {
    const timestamp = formatTimestamp(msg.date);

    const userId = await getUserId(u);
    const channelId = await getUserId(ch.replace("#", ""));

    console.log(`${timestamp} ${u}: ${msg}`);
    console.log(msg);

    await db
      .collection("ban")
      .doc()
      .set({
        timestamp: Timestamp.fromDate(msg.date),
        userId,
        channelId,
      });
  });

  chatClient.onMessage(async (ch, u, message, msg) => {
    const timestamp = formatTimestamp(msg.date);

    const userId = await getUserId(u);
    const channelId = await getUserId(ch.replace("#", ""));

    console.log(`${timestamp} ${u}: ${message}`);

    await db
      .collection("message")
      .doc(msg.id)
      .set({
        timestamp: Timestamp.fromDate(msg.date),
        userId,
        channelId,
        message: message,
      });
  });

  // Not fully implemented yet
  chatClient.onTimeout(async (ch, u, duration, msg) => {
    const timestamp = formatTimestamp(msg.date);

    const userId = await getUserId(u);
    const channelId = await getUserId(ch.replace("#", ""));

    console.log(`${timestamp} ${u}: ${duration} ${msg}`);
    console.log(msg);

    await db
    .collection("timeout")
    .doc()
    .set({
      timestamp: Timestamp.fromDate(msg.date),
      userId,
      channelId,
    });
  })
})();
