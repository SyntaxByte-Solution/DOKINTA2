const { generateId } = require("./middleware/generateId");
const admin = require('./firebase') 
//moment
const moment = require("moment");
const Doctor = require("./models/doctor.model"); //import doctor
//mongoose
const mongoose = require("mongoose");
const ChatTopic = require("./models/chatTopic.model");
const CallHistory = require("./models/callHistory.model");
const Chat = require("./models/chat.model");
const User = require("./models/user.model");

io.on("connection", async (socket) => {
  console.log("Socket Connection done Client ID: ", socket.id);
  console.log("socket.connected:           ", socket.connected);
  console.log("Current rooms:", socket.rooms);
  console.log("socket.handshake.query", socket.handshake.query);

  const { globalRoom } = socket.handshake.query;
  console.log("globalRoom", globalRoom);

  const id = globalRoom && globalRoom.split(":")[1];
  console.log("socket connected with userId:   ", id);

  socket.join(globalRoom);

  //chat
  socket.on("message", async (data) => {
    console.log(
      "data in message =====================================  ",
      data
    );

    console.log("data", data);

    const chatTopic = await ChatTopic.findById(data?.chatTopicId).populate(
      "doctor user"
    );

    console.log("chatTopic------------------42", chatTopic.user);

    const doctorRoom = "globalRoom:" + chatTopic?.doctor?._id.toString();
    const userRoom = "globalRoom:" + chatTopic?.user?._id.toString();

    io.in(doctorRoom).emit("message", data);
    io.in(userRoom).emit("message", data);


    const socket1 = await io.in(doctorRoom).fetchSockets();
    console.log("socket1 in message:", socket1.length);

    const socket2 = await io.in(userRoom).fetchSockets();
    console.log("socket2 in message:", socket2.length);

    let chat;

    if (chatTopic && data?.messageType == 1) {
      chat = new Chat();
      chat.date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      chat.doctor = chatTopic?.doctor;
      chat.user = chatTopic?.user;
      chat.messageType = 1;
      chat.message = data?.message;
      chat.image = "";
      chat.chatTopic = chatTopic._id;
      chat.role = data?.role;
      await chat.save();

      chatTopic.chat = chat._id;
      await chatTopic.save();

      let receiver ={}

      let sender = {}

      if (data.role === "doctor") {

        sender = chatTopic.doctor;
        receiver = chatTopic.user;
      } else if (data.role === "user") {

        sender = chatTopic.user;
        receiver = chatTopic.doctor;
      }

      console.log("data.role", data.role);
      console.log("----------receiver?.fcmToken", receiver);
      if (!receiver?.isBlock) {
        const payload = {
          token: receiver?.fcmToken,
          notification: {
            title: sender?.name,
            body: `${sender?.name} sent a message: ${data?.message}`,
            image: sender.image,
          },
        };



        const adminPromise = await admin
        if (receiver && receiver.fcmToken !== null){
          try {
            const response = await adminPromise.messaging().send(payload);
            console.log("Successfully sent message:", response);
          } catch (error) {
            console.log("Error sending message:", error);
          }
        }

      }
    }
  });

  socket.on("messageRead", async (data) => {
    console.log("Data in messageRead event:", data);

    try {
      const { messageIds } = data;

      await Chat.updateMany(
        { _id: { $in: messageIds } },
        { $set: { isRead: true } }
      );

      console.log(
        `Updated isRead to true for messages with IDs: ${messageIds}`
      );
    } catch (error) {
      console.error("Error updating messages:", error);
    }
  });

  //call

  socket.on("makeCall", async (data) => {
    console.log("makeCall API data ==============================", data);

    let caller, receiver;
    if (data?.role == "doctor") {
      console.log(" make call  role === doctor");

      [caller, receiver] = await Promise.all([
        Doctor.findById(data?.doctorId),
        User.findById(data?.userId),
      ]);

      if (!caller) {
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          "doctor does not found."
        );
      }

      if (caller.isBlock) {
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          "doctor is blocked by the admin.",
          { isBlock: true }
        );
      }

      if (caller.isBusy && caller.callId) {
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          "Oops ! doctor busy with someone else.",
          { isBusy: true }
        );
      }

      if (!receiver) {
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          "patient does not found."
        );
      }

      if (receiver.isBlock) {
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          "patient blocked by the admin.",
          { isBlock: true }
        );
      }

      // if (!receiver.isOnline) {
      //   io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "Oops ! patient is not online.", { isOnline: false });
      // }

      if (receiver.isBusy && receiver.callId !== "") {
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          "Oops ! patient is busy with someone else.",
          { isBusy: true }
        );
      }

      console.log(
        "receiver.isBusy",
        receiver.isBusy,
        "receiver.callId:",
        receiver.callId
      );
      console.log(
        "caller.isBusy",
        caller.isBusy,
        "caller.callId: ",
        caller.callId
      );

      if (!receiver.isBusy && receiver.callId == "") {
        console.log("receiver callId null then emited");

        //history for make call
        const callHistory = new CallHistory();
        callHistory.doctor = caller._id;
        callHistory.user = receiver._id;
        callHistory.callStartTime = moment(new Date()).format("HH:mm:ss");
        callHistory.role = "doctor";
        callHistory.callId = generateId();
        //caller.isBusy = true;
        caller.callId = callHistory._id;

        //receiver.isBusy = true;
        receiver.callId = callHistory._id;

        await Promise.all([callHistory.save(), caller.save(), receiver.save()]);

        const dataOfVideoCall = {
          doctor: caller._id,
          user: receiver._id,
          callerImage: caller.image,
          callerName: caller.name,
          receiverName: receiver.name,
          receiverImage: receiver.image,
          callId: callHistory._id,
          role: "doctor",
        };

        const socket2 = await io
          .in("globalRoom:" + receiver._id)
          .fetchSockets();
        console.log("socket2 in makeCall:", socket2.length, receiver._id);

        io.in("globalRoom:" + receiver._id).emit(
          "callRequest",
          dataOfVideoCall
        );

        io.in("globalRoom:" + caller._id).emit("makeCall", dataOfVideoCall); //for data emit to caller
      } else {
        console.log("Condition not met");
      }
    } else if (data?.role == "user") {
      console.log(" make call  role === user");
      [caller, receiver] = await Promise.all([
        User.findById(data?.userId),
        Doctor.findById(data?.doctorId),
      ]);

      if (!caller) {
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          "user does not found."
        );
      }

      if (caller.isBlock) {
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          "user blocked by the admin.",
          { isBlock: true }
        );
      }

      if (caller.isBusy && caller.callId) {
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          "Oops ! user busy with someone else.",
          { isBusy: true }
        );
      }

      if (!receiver) {
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          "doctor does not found."
        );
      }

      if (receiver.isBlock) {
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          "doctor blocked by the admin.",
          { isBlock: true }
        );
      }

      // if (!receiver.isOnline) {
      //   io.in("globalRoom:" + caller._id.toString()).emit("makeCall", "Oops ! patient is not online.", { isOnline: false });
      // }

      if (receiver.isBusy && receiver.callId === "") {
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          "Oops ! doctor busy with other patient.",
          { isBusy: true }
        );
      }

      console.log(
        "receiver.isBusy",
        receiver.isBusy,
        "receiver.callId:",
        receiver.callId
      );
      console.log(
        "caller.isBusy",
        caller.isBusy,
        "caller.callId: ",
        caller.callId
      );

      console.log(
        "receiver.isBusy",
        receiver.isBusy,
        "receiver.callId:",
        receiver.callId
      );
      console.log(
        "caller.isBusy",
        caller.isBusy,
        "caller.callId: ",
        caller.callId
      );

      if (!receiver.isBusy && receiver.callId == "") {
        console.log("receiver callId null then emmited");

        //history for make call
        const callHistory = new CallHistory();
        callHistory.user = caller._id;
        callHistory.doctor = receiver._id;
        callHistory.callStartTime = moment(new Date()).format("HH:mm:ss");
        callHistory.role = "user";
        //caller.isBusy = true;
        caller.callId = callHistory._id;
        callHistory.callId = generateId();

        //receiver.isBusy = true;
        receiver.callId = callHistory._id;

        await Promise.all([callHistory.save(), caller.save(), receiver.save()]);

        const dataOfVideoCall = {
          doctor: receiver._id,
          user: caller._id,
          callerImage: caller.image,
          callerName: caller.name,
          receiverName: receiver.name,
          receiverImage: receiver.image,
          callId: callHistory._id,
          role: "user",
        };

        console.log("dataOfVideoCall-----------", dataOfVideoCall);
        io.in("globalRoom:" + receiver._id.toString()).emit(
          "callRequest",
          dataOfVideoCall
        );
        io.in("globalRoom:" + caller._id.toString()).emit(
          "makeCall",
          dataOfVideoCall
        ); //for data emit to caller
      } else {
        console.log("Condition not met 361");
      }
    }
  });

  //callAnswer when accept and connect the call
  socket.on("callAnswer", async (data) => {
    console.log("callAnswer data ==============================", data);

    const userIdRoom = "globalRoom:" + data.userId;
    const doctorIdRoom = "globalRoom:" + data.doctorId;
    const role = data.role;

    let caller, receiver;

    const callHistory = await CallHistory.findById(data.callId);

    if (role == "user") {
      [caller, receiver] = await Promise.all([
        Doctor.findById(data.doctorId),
        User.findById(data.userId),
      ]);

      const response = {
        ...data,
        callerImage: caller.image,
        callerName: caller.name,
        receiverName: receiver.name,
        receiverImage: receiver.image,
        designation: caller.designation,
      };

      if (!data.isAccept) {
        console.log("isAccept false ", data.isAccept);

        io.in(userIdRoom).emit("callAnswer", response);
        io.in(doctorIdRoom).emit("callAnswer", response);

        let chatTopic;
        chatTopic = await ChatTopic.findOne({
          doctor: data.doctorId,
          user: data.userId,
        });

        const chat = new Chat();

        if (!chatTopic) {
          chatTopic = new ChatTopic();

          chatTopic.chat = chat._id;
          chatTopic.doctor = caller._id;
          chatTopic.user = receiver._id;
        }

        chat.chatTopic = chatTopic._id;
        chat.doctor = data.doctorId;
        chat.user = data.userId;
        chat.messageType = 5;
        chat.message = "📽 Video Call";
        chat.callType = 2; // 2.declined
        chat.callId = data?.callId;
        chat.isRead = true;
        chat.date = new Date().toLocaleString();
        chat.role = "doctor";
        chatTopic.chat = chat._id;

        callHistory.callEndTime = moment().format("HH:mm:ss");

        var date1 = moment(callHistory.callStartTime, "HH:mm:ss");
        var date2 = moment(callHistory.callEndTime, "HH:mm:ss");
        var timeDifference = date2.diff(date1);
        var duration = moment.duration(timeDifference);
        var durationTime = moment
          .utc(duration.asMilliseconds())
          .format("HH:mm:ss");

        callHistory.callConnect = false;
        callHistory.duration = durationTime;

        const [receiverUpdate] = await Promise.all([
          User.findOneAndUpdate(
            { _id: data.userId },
            { $set: { isBusy: false, callId: "" } },
            { new: true }
          ),
          chat.save(),
          chatTopic.save(),
          callHistory.save(),
        ]);

        console.log(
          "receiverUpdate in callAnswer isAccept false: ",
          receiverUpdate.isBusy,
          receiverUpdate.callId
        );
      } else {
        console.log("isAccept true ", data.isAccept);

        if (receiver.callId === data.callId) {
          console.log("callAnswer emit to Caller ===============");

          io.in(userIdRoom).emit("callAnswer", response);
          io.in(doctorIdRoom).emit("callAnswer", response);

          let chatTopic;
          chatTopic = await ChatTopic.findOne({
            doctor: data.doctorId,
            user: data.userId,
          });

          const chat = new Chat();

          if (!chatTopic) {
            chatTopic = new ChatTopic();

            chatTopic.chat = chat._id;
            chatTopic.doctor = data.doctorId;
            chatTopic.user = data.userId;
          }

          chat.chatTopic = chatTopic._id;
          chat.doctor = data.doctorId;
          chat.user = data.userId;
          chat.messageType = 5;
          chat.message = "📽 Video Call";
          chat.callType = 1; //1.received
          chat.callId = data.callId;
          chat.date = new Date().toLocaleString();
          chat.role = "doctor";

          chatTopic.chat = chat._id;

          await Promise.all([
            chat.save(),
            chatTopic.save(),
            CallHistory.findOneAndUpdate(
              { _id: callHistory._id },
              {
                $set: {
                  callConnect: true,
                  callStartTime: moment().format("HH:mm:ss"),
                },
              },
              { new: true }
            ),
          ]);

          console.log(
            "receiver available ........... receiver call accept......... "
          );

          const socket1 = await io.in(doctorIdRoom).fetchSockets();
          const socket2 = await io.in(userIdRoom).fetchSockets();

          socket1?.length
            ? socket1[0].join(data.doctorId)
            : console.log("socket1 not able to emit");
          socket2?.length
            ? socket2[0].join(data.userId)
            : console.log("socket2 not able to emit");

          const xyz = io.sockets.adapter.rooms.get(globalRoom);
          console.log(
            "callId joined sockets in callAnswer ====================================: ",
            xyz
          );
        } else {
          console.log(
            "callCancel emit to user if isAccept false ==================",
            data.userId
          );

          const response = {
            ...data,
            callerImage: caller.image,
            callerName: caller.name,
            receiverName: receiver.name,
            receiverImage: receiver.image,
            designation: caller.designation,
          };

          io.in(userIdRoom).emit("callCancel", response);
          io.in(doctorIdRoom).emit("callCancel", response);
        }
      }
    } else if (role === "doctor") {
      [caller, receiver] = await Promise.all([
        User.findById(data.userId),
        Doctor.findById(data.doctorId),
      ]);
      const response = {
        ...data,
        callerImage: caller.image,
        callerName: caller.name,
        receiverName: receiver.name,
        receiverImage: receiver.image,
        designation: receiver.designation,
      };

      if (!data.isAccept) {
        console.log("isAccept false ", data.isAccept);

        io.in(doctorIdRoom).emit("callAnswer", response);
        io.in(userIdRoom).emit("callAnswer", response);
        let chatTopic;
        chatTopic = await ChatTopic.findOne({
          doctor: data.doctorId,
          user: data.userId,
        });

        const chat = new Chat();

        if (!chatTopic) {
          chatTopic = new ChatTopic();

          chatTopic.chat = chat._id;
          chatTopic.doctor = data.doctorId;
          chatTopic.user = data.userId;
        }

        chat.chatTopic = chatTopic._id;
        chat.doctor = data.doctorId;
        chat.user = data.userId;
        chat.messageType = 5;
        chat.message = "📽 Video Call";
        chat.callType = 2; // 2.declined
        chat.callId = data?.callId;
        chat.isRead = true;
        chat.role = "user";
        chat.date = new Date().toLocaleString();

        chatTopic.chat = chat._id;

        callHistory.callEndTime = moment().format("HH:mm:ss");

        var date1 = moment(callHistory.callStartTime, "HH:mm:ss");
        var date2 = moment(callHistory.callEndTime, "HH:mm:ss");
        var timeDifference = date2.diff(date1);
        var duration = moment.duration(timeDifference);
        var durationTime = moment
          .utc(duration.asMilliseconds())
          .format("HH:mm:ss");

        callHistory.callConnect = false;
        callHistory.duration = durationTime;

        const [receiverUpdate] = await Promise.all([
          Doctor.findOneAndUpdate(
            { _id: callHistory.doctor },
            { $set: { isBusy: false, callId: "" } },
            { new: true }
          ),
          chat.save(),
          chatTopic.save(),
          callHistory.save(),
        ]);

        console.log(
          "receiverUpdate in callAnswer isAccept false: ",
          receiverUpdate.isBusy,
          receiverUpdate.callId
        );
      } else {
        console.log("isAccept true ", data.isAccept);

        if (receiver.callId === data.callId) {
          console.log("callAnswer emit to Caller ===============");

          io.in(userIdRoom).emit("callAnswer", response);
          io.in(doctorIdRoom).emit("callAnswer", response);
          let chatTopic;
          chatTopic = await ChatTopic.findOne({
            doctor: data.doctorId,
            user: data.userId,
          });

          const chat = new Chat();

          if (!chatTopic) {
            chatTopic = new ChatTopic();

            chatTopic.chat = chat._id;
            chatTopic.doctor = caller._id;
            chatTopic.user = receiver._id;
          }

          chat.chatTopic = chatTopic._id;
          chat.doctor = data.doctorId;
          chat.user = data.userId;
          chat.messageType = 5;
          chat.message = "📽 Video Call";
          chat.callType = 1; //1.received
          chat.callId = data.callId;
          chat.role = "user";
          chat.date = new Date().toLocaleString();

          chatTopic.chat = chat._id;

          await Promise.all([
            chat.save(),
            chatTopic.save(),
            CallHistory.findOneAndUpdate(
              { _id: callHistory._id },
              {
                $set: {
                  callConnect: true,
                  callStartTime: moment().format("HH:mm:ss"),
                },
              },
              { new: true }
            ),
          ]);

          console.log(
            "receiver available ........... receiver call accept......... "
          );

          const socket1 = await io.in(doctorIdRoom).fetchSockets();
          const socket2 = await io.in(userIdRoom).fetchSockets();

          socket1?.length
            ? socket1[0].join(data.callId)
            : console.log("socket1 not able to emit");
          socket2?.length
            ? socket2[0].join(data.callId)
            : console.log("socket2 not able to emit");

          const xyz = io.sockets.adapter.rooms.get(globalRoom);
          console.log(
            "callId joined sockets in callAnswer ====================================: ",
            xyz
          );
        } else {
          console.log(
            "callCancel emit to receiver if isAccept false ==================",
            receiver._id
          );

          io.in(userIdRoom).emit("callCancel", response);
          io.in(doctorIdRoom).emit("callCancel", response);
        }
      }
    }
  });

  //callCancel when caller cut the call

  socket.on("callCancel", async (data) => {
    console.log("data in callCancel ================", data);

    const callHistory = await CallHistory.findById(data?.callId);

    console.log("callHistory in callCancel:    ", callHistory);

    io.in("globalRoom:" + callHistory?.user).emit("callCancel", data);
    io.in("globalRoom:" + callHistory?.doctor).emit("callCancel", data);
    console.log("callHistory in callCancel:    ", callHistory);

    callHistory.callEndTime = moment().format("HH:mm:ss");

    var date1 = moment(callHistory.callStartTime, "HH:mm:ss");
    var date2 = moment(callHistory.callEndTime, "HH:mm:ss");
    var timeDifference = date2.diff(date1);
    var duration = moment.duration(timeDifference);
    var durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

    callHistory.callConnect = false;
    callHistory.duration = durationTime;
    let caller, receiver;
    let role = data?.role;
    if (callHistory) {
      let chatTopic;
      if (role == "doctor") {
        [caller, receiver] = await Promise.all([
          Doctor.findById(callHistory.doctor), //data.callerId
          User.findById(callHistory.user), //data.receiverId
        ]);
        const [callerUpdate, receiverUpdate] = await Promise.all([
          Doctor.findOneAndUpdate(
            { _id: caller._id },
            { $set: { isBusy: false, callId: "" } },
            { new: true }
          ),
          User.findOneAndUpdate(
            { _id: receiver._id },
            { $set: { isBusy: false, callId: "" } },
            { new: true }
          ),
          callHistory.save(),
        ]);
        console.log(
          "callerUpdate modified: ",
          callerUpdate.isBusy,
          callerUpdate.callId
        );
        console.log(
          "receiverUpdate modified: ",
          receiverUpdate.isBusy,
          receiverUpdate.callId
        );

        chatTopic = await ChatTopic.findOne({
          doctor: caller._id,
          user: receiver._id,
        });

        const chat = new Chat();

        if (!chatTopic) {
          chatTopic = new ChatTopic();

          chatTopic.chat = chat._id;
          chatTopic.doctor = caller._id;
          chatTopic.user = receiver._id;
          await chatTopic.save();
        }

        chat.chatTopic = chatTopic._id;
        chat.callId = callHistory._id;
        chat.doctor = callHistory.caller;
        chat.messageType = 5;
        chat.message = "📽 Video Call";
        chat.callType = 3; //3.missedCall
        chat.date = new Date().toLocaleString();
        chat.isRead = true;

        chatTopic.chat = chat._id;

        await Promise.all([chat.save(), chatTopic.save()]);
      } else if (role === "user") {
        [caller, receiver] = await Promise.all([
          User.findById(callHistory.user), //data.callerId
          Doctor.findById(callHistory.doctor), //data.receiverId
        ]);
        const [callerUpdate, receiverUpdate] = await Promise.all([
          User.findOneAndUpdate(
            { _id: caller._id },
            { $set: { isBusy: false, callId: "" } },
            { new: true }
          ),
          Doctor.findOneAndUpdate(
            { _id: receiver._id },
            { $set: { isBusy: false, callId: "" } },
            { new: true }
          ),
          callHistory.save(),
        ]);
        console.log(
          "callerUpdate modified: ",
          callerUpdate.isBusy,
          callerUpdate.callId
        );
        console.log(
          "receiverUpdate modified: ",
          receiverUpdate.isBusy,
          receiverUpdate.callId
        );

        chatTopic = await ChatTopic.findOne({
          doctor: caller._id,
          user: receiver._id,
        });

        const chat = new Chat();

        if (!chatTopic) {
          chatTopic = new ChatTopic();

          chatTopic.chat = chat._id;
          chatTopic.user = caller._id;
          chatTopic.doctor = receiver._id;
          await chatTopic.save();
        }

        chat.chatTopic = chatTopic._id;
        chat.callId = callHistory._id;
        chat.doctor = callHistory.doctor;
        chat.messageType = 5;
        chat.message = "📽 Video Call";
        chat.callType = 3; //3.missedCall
        chat.date = new Date().toLocaleString();
        chat.isRead = true;

        chatTopic.chat = chat._id;

        await Promise.all([chat.save(), chatTopic.save()]);
      }
    }

    const payload = {
      token: receiver.fcmToken,
      notification: {
        title: caller.name,
        body: `Incoming missed call from ${caller.name}.`,
      },
    };

    const adminPromise = await admin
    if (receiver && receiver.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }
  });

  //callDisconnect when call connect between both users (receiver or caller cut the call)
  socket.on("callDisconnect", async (data) => {
    console.log("data in callDisconnect ====================", data);

    const xyz = io.sockets.adapter.rooms.get(data?.callId);
    console.log(
      "data.callId callDisconnect ====================================: ",
      xyz
    );

    io.to(data?.callId).emit("callDisconnect", data); //callId join in globalRoom when both users join in call at that time
    //io.socketsLeave(data?.callId);

    const [callHistory, caller, receiver] = await Promise.all([
      CallHistory.findById(data.callId),
      User.findById(data.callerId), //callHistory.callerId
      User.findById(data.receiverId), //callHistory.receiverId
    ]);

    callHistory.callEndTime = moment().format("HH:mm:ss");

    var date1 = moment(callHistory.callStartTime, "HH:mm:ss");
    var date2 = moment(callHistory.callEndTime, "HH:mm:ss");
    var timeDifference = date2.diff(date1);
    var duration = moment.duration(timeDifference);
    var durationTime = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

    callHistory.callConnect = false;
    callHistory.duration = durationTime;

    if (callHistory) {
      const [callerUpdate, receiverUpdate] = await Promise.all([
        User.findOneAndUpdate(
          { _id: caller._id },
          { $set: { isBusy: false, callId: "" } },
          { new: true }
        ),
        User.findOneAndUpdate(
          { _id: receiver._id },
          { $set: { isBusy: false, callId: "" } },
          { new: true }
        ),
        Chat.findOneAndUpdate(
          { callId: callHistory._id },
          {
            $set: {
              callDuration: durationTime,
              messageType: 3,
              callType: 1, //1.received
              isRead: true,
            },
          },
          { new: true }
        ),
        callHistory.save(),
      ]);

      console.log(
        "callerUpdate modified in callDisconnect: ",
        callerUpdate.isBusy,
        callerUpdate.callId
      );
      console.log(
        "receiverUpdate modified in callDisconnect: ",
        receiverUpdate.isBusy,
        receiverUpdate.callId
      );
    }
  });

  socket.on("disconnect", async (reason) => {
    console.log(`socket disconnect ===============`, id, socket?.id, reason);
  });
});
