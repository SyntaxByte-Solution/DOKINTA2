const ChatTopic = require("../../models/chatTopic.model");

//import model
const Doctor = require("../../models/doctor.model");

//day.js
const dayjs = require("dayjs");

//mongoose
const mongoose = require("mongoose");

//get thumb list of chat between the users
exports.getChatList = async (req, res) => {
  try {
    if (!req.query.doctorId) {
      return res
        .status(200)
        .json({ status: false, message: "doctorId must be required." });
    }

    let now = dayjs();

    const doctorId = new mongoose.Types.ObjectId(req.query.doctorId);

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const [doctor, chatList] = await Promise.all([
      Doctor.findById(doctorId),

      ChatTopic.aggregate([
        {
          $match: {
            doctor: doctorId,
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
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: {
                                      $divide: ["$$timeDiff", 31536000000],
                                    },
                                  },
                                },
                                " years ago",
                              ],
                            },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 2592000000] },
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: {
                                      $divide: ["$$timeDiff", 2592000000],
                                    },
                                  },
                                },
                                " months ago",
                              ],
                            },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 604800000] },
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: {
                                      $divide: ["$$timeDiff", 604800000],
                                    },
                                  },
                                },
                                " weeks ago",
                              ],
                            },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 86400000] },
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: {
                                      $divide: ["$$timeDiff", 86400000],
                                    },
                                  },
                                },
                                " days ago",
                              ],
                            },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 3600000] },
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: {
                                      $divide: ["$$timeDiff", 3600000],
                                    },
                                  },
                                },
                                " hours ago",
                              ],
                            },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 60000] },
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: { $divide: ["$$timeDiff", 60000] },
                                  },
                                },
                                " minutes ago",
                              ],
                            },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 1000] },
                            then: {
                              $concat: [
                                {
                                  $toString: {
                                    $floor: { $divide: ["$$timeDiff", 1000] },
                                  },
                                },
                                " seconds ago",
                              ],
                            },
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

    if (!doctor) {
      return res
        .status(200)
        .json({ status: false, message: "doctor does not found." });
    }

    if (doctor.isBlock) {
      return res
        .status(200)
        .json({ status: false, message: "you are blocked by the admin." });
    }

    return res
      .status(200)
      .json({ status: true, message: "Success", data: chatList });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        status: false,
        message: error.errorMessage || "Internal Server Error",
      });
  }
};
