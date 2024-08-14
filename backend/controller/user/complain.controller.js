const Appointment = require("../../models/appointment.model");
const User = require("../../models/user.model");
const Complain = require("../../models/complain.model");
const { deleteFile } = require("../../middleware/deleteFile");
const admin = require('../../firebase')
exports.raiseComplain = async (req, res) => {
  try {
    if (!req.body.details || !req.body.userId || !req.body.isComplain) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details!!" });
    }

    const user = await User.findById(req.body.userId);

    if (!user) {
      if (req.file) deleteFile(req.file);
      return res
        .status(200)
        .send({ status: false, message: "User Not Found!!" });
    }

    let appointment = {};
    let complain = new Complain();
    if (req.body.appointmentId) {
      appointment = await Appointment.findOne({
        appointmentId: req.body.appointmentId,
      });

      if (!appointment) {
        return res
          .status(200)
          .send({ status: false, message: "appointment Not Found!!" });
      }
      complain.appointmentId = req.body.appointmentId;
      complain.appointment = appointment._id;
    }

    let payload;

    complain.user = user._id;
    complain.person = 2;



    complain.details = req.body.details;
    complain.isComplain = req.body.isComplain;
    if (req.file) {
      complain.image = req.file ? process.env.baseURL + req.file.path : "";
    }
    await complain.save();

    payload = {
      token: user?.fcmToken,
      notification: {
        body: `Dear ${user?.name ? user.name : "Dear User"
          } Your Complain for appointment Id ${appointment.appointmentId
          } is raise Successfully.Your feedback is crucial, and we're here to assist you.Thank you`,
        title: "Raise complain successfully",
      },
    };

    const adminPromise = await admin
    if (user && user.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(userPayload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    return res.status(200).send({
      status: true,
      message: "Your Complain Have Been Raised Successfully",
      complain,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.pendingSolvedComplains = async (req, res) => {
  try {
    const start = req.query.start || 0;
    const limit = req.query.limit || 10;
    const skipAmount = start * limit;

    const { type, userId } = req.query;
    if (!type || !userId) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details!!" });
    }
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: "User Not Found!!" });
    }

    if (type != 1 && type != 2 && type != 3) {
      return res.status(200).send({ status: false, message: "Invalid type!!" });
    }
    let result;
    let total;
    if (type == 3) {
      result = await Complain.find({ person: 2, user: user._id })
        .populate({
          path: "appointment",
          select: "appointmentId",
        })
        .sort({ createdAt: -1 })
        .skip(skipAmount)
        .limit(limit)
        .exec();
    } else {
      result = await Complain.find({ person: 2, type, user: user._id })
        .populate({
          path: "appointment",
          select: "appointmentId",
        })
        .sort({ createdAt: -1 })
        .skip(skipAmount)
        .limit(limit)
        .exec();
    }

    if (type == 3) {
      total = await Complain.countDocuments({ person: 2 });
    } else {
      total = await Complain.countDocuments({ person: 2, type });
    }

    return res
      .status(200)
      .send({ status: true, message: "success", total, data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
