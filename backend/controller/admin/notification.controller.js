const Notification = require("../../models/notification.model");
const User = require("../../models/user.model");
const Doctor = require("../../models/doctor.model");
const admin = require("../../firebase");

exports.particularUserNotification = async (req, res) => {
  try {
    console.log("req.body", req.body);

    if (!req.query.userId) {
      return res
        .status(400) // Changed status to 400 for invalid request
        .send({ status: false, message: "Oops! Invalid details!!" });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res
        .status(404) // Changed status to 404 for not found
        .send({ status: false, message: "User does not exist" });
    }

    const payload = {
      token: user.fcmToken,
      notification: {
        body: req.body.message,
        title: req.body.title,
        image: req.file ? process.env.baseURL + req.file.path : "",
      },
    };

    console.log("payload", payload);
    const notification = new Notification({
      user: user._id,
      title: req.body.title,
      image: req.file ? process?.env?.baseURL + req.file.path : "",
      message: req.body.message,
      notificationType: 1,
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    });

    await notification.save();

    const adminPromise = await admin;
    if (user && user.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    return res
      .status(200)
      .json({ status: true, message: "Success", notification });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.particularDoctorNotification = async (req, res) => {
  try {
    if (!req.query.doctorId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }
    const doctor = await Doctor.findById(req.query.doctorId);
    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "Doctor does not exist" });
    }

    if (!req.body.message || !req.body.title) {
      return res.status(200).send({
        status: false,
        message: "Missing message or title in the request body.",
      });
    }

    const payload = {
      token: doctor.fcmToken,
      notification: {
        body: req.body.message,
        title: req.body.title,
        image: req.file ? process.env.baseURL + req.file.path : "",
      },
    };

    console.log("payload", payload);
    const notification = new Notification();

    notification.doctor = doctor._id;
    notification.title = req.body.title;
    notification.image = req.file ? process?.env?.baseURL + req.file.path : "";
    notification.message = req.body.message;
    notification.notificationType = 2;
    notification.date = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    await notification.save();

    const adminPromise = await admin;
    if (doctor && doctor.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }
    return res
      .status(200)
      .json({ status: true, message: "Success", notification });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.allUserNotification = async (req, res) => {
  try {
    console.log("req.body", req.body);

    // Fetch all users from the database
    const users = await User.find({});
    if (!users || users.length === 0) {
      return res
        .status(404) // Changed status to 404 for not found
        .send({ status: false, message: "No users found" });
    }

    // Create an array to store the results of each notification attempt
    const notificationResults = [];

    // Iterate over each user to send the notification
    for (const user of users) {
      console.log("user.fcmToken", user.fcmToken);
      const payload = {
        token: user.fcmToken,
        notification: {
          body: req.body.message,
          title: req.body.title,
          image: req.file ? process.env.baseURL + req.file.path : "",
        },
      };

      console.log("payload", payload);
      const notification = new Notification({
        user: user._id,
        title: req.body.title,
        image: req.file ? process?.env?.baseURL + req.file.path : "",
        message: req.body.message,
        notificationType: 1,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      });

      await notification.save();
      if (user && user.fcmToken !== null) {
        try {
          const response = await admin.messaging().send(payload);
          console.log("Successfully sent message:", response);
          notificationResults.push({
            user: user._id,
            status: true,
            message: "Notification sent",
          });
        } catch (error) {
          console.log("Error sending message:", error);

          notificationResults.push({
            user: user._id,
            status: false,
            message: error.message || "Internal Server Error",
          });
        }
      }
    }

    // Return the result of the notification attempts
    return res.status(200).json({
      status: true,
      message: "Notifications processed",
      results: notificationResults,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

