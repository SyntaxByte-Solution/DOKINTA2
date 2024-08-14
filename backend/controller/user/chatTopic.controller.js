const ChatTopic = require("../../models/chatTopic.model");

//import model
const User = require("../../models/user.model");
const Doctor = require("../../models/doctor.model");

//day.js
const dayjs = require("dayjs");

//mongoose
const mongoose = require("mongoose");

//get thumb list of chat between the users
exports.getChatList = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "UserId must be required." });
    }

    let now = dayjs();

    const userId = new mongoose.Types.ObjectId(req.query.userId);


    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const [user, chatList] = await Promise.all([
      User.findById(userId),


      ChatTopic.aggregate([
        {
          $match: {
            user: userId,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctor",
            foreignField: "_id",
            as: "doctor",
          },
        },
        {
          $unwind: {
            path: "$doctor",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "chats",
            localField: "chat",
            foreignField: "_id",
            as: "chat",
          },
        },
        {
          $unwind: {
            path: "$chat",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            chatTopic: "$chat.chatTopic",
            sender: "$doctor._id",
            senderName: "$doctor.name",
            senderImage: "$doctor.image",
            designation: "$doctor.designation",
            message: "$chat.message",
            role: "$chat.role",
            name: "$user.name",
            image: "$user.image",
            user: "$user._id",

            time: {
              $let: {
                vars: {
                  timeDiff: { $subtract: [now.toDate(), "$chat.createdAt"] },
                },
                in: {
                  $concat: [
                    {
                      $switch: {
                        branches: [
                          {
                            case: { $gte: ["$$timeDiff", 31536000000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 31536000000] } } }, " years ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 2592000000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 2592000000] } } }, " months ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 604800000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 604800000] } } }, " weeks ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 86400000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 86400000] } } }, " days ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 3600000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 3600000] } } }, " hours ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 60000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 60000] } } }, " minutes ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 1000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 1000] } } }, " seconds ago"] },
                          },
                          { case: true, then: "Just now" },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        { $sort: { createdAt: 1 } },
        { $skip: start * limit },
        { $limit: limit },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }


    return res.status(200).json({ status: true, message: "Success", data: chatList });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.errorMessage || "Internal Server Error" });
  }
};

//search the users with chat has been done
exports.chatWithUserSearch = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.searchString) {
      return res.status(200).json({
        status: false,
        message: "Oops ! Invalid details.",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    const response = await User.find({
      name: { $regex: req.query.searchString, $options: "i" },
      isBlock: false,
    });

    const searchDataPromises = response.map(async (user) => {
      const chatTopic = await ChatTopic.findOne({
        $or: [
          { $and: [{ sender: user._id }, { receiverUserId: userId }] },
          { $and: [{ senderUser: userId }, { receiverUserId: user._id }] },
        ],
      });

      if (chatTopic) {
        return {
          _id: user._id,
          name: user.name,
          userName: user.userName,
          image: user.image,
        };
      } else {
        return null;
      }
    });

    const searchData = await Promise.all(searchDataPromises);

    const filteredSearchData = searchData.filter((data) => data !== null);

    if (filteredSearchData.length > 0) {
      return res.status(200).json({
        status: true,
        message: "Success",
        data: filteredSearchData,
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "No data found.",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get recent chat with user
exports.recentChatWithUsers = async (req, res, next) => {
  try {
    if (!req.query.userId) {
      return res.status(400).json({ status: false, message: "userId is required." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, recentChats] = await Promise.all([
      User.findById(userId),

      ChatTopic.aggregate([
        {
          $match: {
            $or: [{ senderUserId: userId }, { receiverUserId: userId }],
          },
        },
        {
          $lookup: {
            from: "users",
            let: {
              senderUserId: "$senderUserId",
              receiverUserId: "$receiverUserId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $cond: {
                      if: { $eq: ["$$senderUserId", userId] },
                      then: { $eq: ["$$receiverUserId", "$_id"] },
                      else: { $eq: ["$$senderUserId", "$_id"] },
                    },
                  },
                },
              },
            ],
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "chats",
            localField: "chatId",
            foreignField: "_id",
            as: "chat",
          },
        },
        {
          $unwind: {
            path: "$chat",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            name: "$user.name",
            userName: "$user.userName",
            image: "$user.image",
            isOnline: "$user.isOnline",
            userId: "$user._id",
          },
        },
        { $sort: { createdAt: 1 } },
        { $limit: 10 },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    return res.status(200).json({ status: true, message: "Recent chats retrieved successfully.", data: recentChats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
