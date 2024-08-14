const Appointment = require("../../models/appointment.model");
const Doctor = require("../../models/doctor.model");
const User = require("../../models/user.model");
const Holiday = require("../../models/doctorHoliday.model");
const DoctorBusy = require("../../models/doctorBusy.model");
const Wallet = require("../../models/userWallet.model");
const moment = require("moment");
const DoctorWalletHistory = require("../../models/doctorWalletHistory.model");
const WalletHistory = require("../../models/userWalletHistory.model");
const UString = require("../../models/uniqueString.model");
const admin = require("../../firebase");

exports.appointMentForDoctor = async (req, res) => {
  try {
    if (!req.query.doctorId || !req.query.status) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details" });
    }

    const status = parseInt(req.query.status);

    if (status && status !== 1 && status !== 3 && status !== 4) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid appointment Type" });
    }
    const doctor = await Doctor.findById(req.query.doctorId);
    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "doctor Not Found" });
    }

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = start * limit;

    const pipeline = [
      { $match: { doctor: doctor._id } },
      { $match: getStatusFilter(status) },
      { $sort: { date: -1, time: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      //   {
      //     $lookup: {
      //       from: "doctors",
      //       localField: "doctor",
      //       foreignField: "_id",
      //       as: "doctor",
      //     },
      //   },
      //   { $unwind: "$doctor" },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          status: 1,
          user: { _id: 1, name: 1, image: 1 },
          service: 1,
          date: 1,
          time: 1,
          paymentStatus: 1,
          appointmentId: 1,
          amount: 1,
          withoutTax: 1,
          cancel: 1,
          doctorEarning: 1,
          type: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const appointment = await Appointment.aggregate(pipeline);

    return res
      .status(200)
      .send({ status: true, message: "Success", data: appointment });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.appointmentTypeStatusWise = async (req, res) => {
  try {
    const { type, status, doctorId, month } = req.query;

    // type 1 = today, 2 = yesterday, 3 = this week, 4 = this month
    if (type) {
      if (type != 1 && type != 2 && type != 3 && type != 4) {
        return res.status(200).send({ status: false, message: "Invalid Type" });
      }
    }

    if (status != "ALL" && status != 1 && status != 3 && status != 4) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid appointment Status" });
    }

    if (!doctorId || !status || !month) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details" });
    }

    const currentMonth = moment().format("YYYY-MM");
    if (month == currentMonth) {
      if (!type) {
        return res
          .status(200)
          .send({ status: false, message: "Type is required" });
      }
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "doctor Not Found" });
    }

    let dateFilterQuery = {};

    if (type == 1) {
      const startOfDay = moment().startOf("day");
      const endOfDay = moment().endOf("day");

      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (type == 2) {
      const startOfDay = moment().startOf("day").subtract(1, "days");
      const endOfDay = moment().endOf("day").subtract(1, "days");
      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (type == 3) {
      const startOfDay = moment().startOf("week");
      const endOfDay = moment().endOf("week");
      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (type == 4) {
      const startOfDay = moment().startOf("month");
      const endOfDay = moment().endOf("month");
      dateFilterQuery = {
        analytic: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
      };
    } else if (!type && month) {
      const startOfMonth = moment(month, "YYYY-MM").startOf("month");
      const endOfMonth = moment(month, "YYYY-MM").endOf("month");

      dateFilterQuery = {
        analytic: { $gte: new Date(startOfMonth), $lte: new Date(endOfMonth) },
      };
    }

    if (status == "ALL") {
      statusQuery = { $in: [1, 2, 3, 4] };
    } else if (status == 1) {
      statusQuery = { $in: [1, 2] };
    } else if (status == 3) {
      statusQuery = 3;
    } else if (status == 4) {
      statusQuery = 4;
    } else {
      return res.status(200).send({ status: false, message: "Invalid Type" });
    }

    const data = await Appointment.aggregate([
      {
        $addFields: {
          analytic: { $toDate: "$date" },
        },
      },
      {
        $match: {
          doctor: doctor._id,
          $or: [{ status: statusQuery }, { status: { $eq: statusQuery } }],
          ...dateFilterQuery,
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "services",
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
        $unwind: "$user",
      },

      {
        $facet: {
          pendingAppointment: [
            {
              $match: { status: 1 },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                appointments: { $push: "$$ROOT" },
              },
            },
          ],
          completedAppointment: [
            {
              $match: { status: 3 },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                amount: { $sum: "$doctorEarning" },
                appointments: { $push: "$$ROOT" },
              },
            },
          ],
          cancelAppointment: [
            {
              $match: { status: 4 },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                appointments: { $push: "$$ROOT" },
              },
            },
          ],
        },
      },
    ]);

    const stats = {
      amount: data[0]?.completedAppointment[0]?.amount || 0,
      pendingAppointment: data[0]?.pendingAppointment[0]?.total || 0,
      completedAppointment: data[0]?.completedAppointment[0]?.total || 0,
      cancelAppointment: data[0]?.cancelAppointment[0]?.total || 0,
      pendingAppointmentsArray:
        data[0]?.pendingAppointment[0]?.appointments || [],
      completedAppointmentsArray:
        data[0]?.completedAppointment[0]?.appointments || [],
      cancelledAppointmentsArray:
        data[0]?.cancelAppointment[0]?.appointments || [],
    };

    return res.status(200).send({
      status: true,
      message: "Success",
      data: stats,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.confirmAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.query;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(200)
        .send({ status: false, message: "Appointment not found" });
    }

    const [user, doctor] = await Promise.all([
      await User.findById(appointment.user),
      await Doctor.findById(appointment.doctor),
    ]);

    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "Doctor not found" });
    }



    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: "user not found" });
    }


    // if (appointment.paymentStatus == 1) {
    //   return res
    //     .status(200)
    //     .send({
    //       status: false,
    //       message: "Payment of this service is not made by user yet",
    //     });
    // }

    if (appointment.status !== 1) {
      return res
        .status(200)
        .send({ status: false, message: "This appointment is not pending" });
    }
    appointment.status = 2;
    appointment.checkInTime = moment().format("hh:mm A");


    const payload = {
      token: user.fcmToken,
      notification: {
        body: `Your appointment is Starting soon by doctor with appointmentId ${appointment.appointmentId}.`,
        title: "Appointment time is starting",
      },

    };

    const adminPromise = await admin
    if (user && user.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    await appointment.save();
    return res
      .status(200)
      .send({ status: true, message: "Patient successfully check In " });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.query;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(200)
        .send({ status: false, message: "Appointment not found" });
    }

    const [user, doctor] = await Promise.all([
      await User.findById(appointment.user),
      await Doctor.findById(appointment.doctor),
    ]);
    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "doctor not found" });
    }

    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: "user not found" });
    }

    appointment.status = 3;
    appointment.checkInOut = moment().format("hh:mm A");

    doctor.wallet += appointment.doctorEarning;
    doctor.totalWallet += appointment.doctorEarning;
    const doctorWallet = await DoctorWalletHistory.create({
      amount: appointment.amount,
      doctor: doctor._id,
      appointment: appointment._id,
      type: 1,
    });

    await Promise.all([
      appointment.save(),
      doctor.save(),
      doctorWallet.save(),
      UString.findOneAndDelete({ appointment: appointment._id }),
    ]);



    const payload = {
      token: user.fcmToken,
      notification: {
        body: `Your appointment is completed by doctor with appointmentId ${appointment.appointmentId}.`,
        title: "Appointment completed",
      },
    };

    const adminPromise = await admin
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
      .send({ status: true, message: "Patient successfully check out" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    if (!req.query.appointmentId || !req.query.reason) {
      return res
        .status(200)
        .send({ status: false, message: "Oops Invalid Details!!" });
    }

    const appointment = await Appointment.findById(req.query.appointmentId);
    if (!appointment) {
      return res
        .status(200)
        .send({ status: false, message: "Appointment not found!" });
    }

    const user = await User.findById(appointment.user);
    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: "user not found!" });
    }
    const userWallet = await Wallet.findOne({ user: user._id });

    if (!userWallet) {
      return res.status(200).send({
        status: false,
        message:
          "user wallet details not found!,contact admin for further details",
      });
    }

    if (appointment.status != 1) {
      return res.status(200).send({
        status: false,
        message: "You can only cancel pending appointments!",
      });
    }

    appointment.status = 4;
    appointment.cancel.person = 2;
    appointment.cancel.time = moment().format("HH:mm:ss");
    appointment.cancel.date = moment().format("YYYY-MM-DD");
    appointment.cancel.reason = req.query.reason;
    userWallet.amount += appointment.amount;
    const walletHistory = await WalletHistory.findOne({
      appointment: appointment._id,
    });
    if (walletHistory) {
      await walletHistory.deleteOne();
    }


    const payload = {
      token: user.fcmToken,
      notification: {
        body: `Your appointment has been cancelled by admin with appointmentId ${appointment.appointmentId}.`,
        title: "Appointment cancelled",
      },

    };


    console.log("payload", payload);
    const notification = new Notification({
      user: user._id,
      title: "Appointment cancelled",
      message: `Your appointment has been cancelled by doctor with appointmentId ${appointment.appointmentId}.`,
      notificationType: 1,
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    });

    const adminPromise = await admin
    if (user && user.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }
    await Promise.all([

      appointment.save(),
      userWallet.save(),
      UString.findOneAndDelete({ appointment: appointment._id }),
      notification.save(),
    ]);
    return res.status(200).send({
      status: true,
      message: "Appointment cancel successfully",
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
// exports.payForService = async (req, res) => {
//   try {
//     const { appointmentId } = req.query;
//     const appointment = await Appointment.findById(appointmentId);
//     if (!appointment) {
//       return res
//         .status(200)
//         .send({ status: false, message: "Appointment not found" });
//     }

//     if (appointment.paymentStatus == 2) {
//       return res.status(200).send({
//         status: false,
//         message: "Client has Already Paid For The Service ",
//       });
//     } else if (booking.paymentStatus == 1) {
//       appointment.paymentStatus = 2;

//       await appointment.save();
//       return res.status(200).send({
//         status: true,
//         message: "Client  Paid For The Service Successfully",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       status: false,
//       message: error.message || "Internal Server Error!!",
//     });
//   }
// };

function getStatusFilter(status) {
  switch (status) {
    case 1:
      return { status: { $in: [1, 2] } };
    case "ALL":
      return {};
    default:
      return { status };
  }
}

exports.checkDates = async (req, res) => {
  try {
    if (!req.query.date || !req.query.doctorId) {
      return res
        .status(200)
        .send({ status: false, message: "Oops Invalid Details!!" });
    }
    const dayOfWeek = moment(req.query.date).format("dddd");

    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    });

    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "doctor Not Found!!!" });
    }
    const holiday = await Holiday.findOne({
      date: req.query.date,
      doctor: doctor._id,
    });

    if (holiday) {
      return res.status(200).send({
        status: true,
        timeSlots: [],
        isOpen: false,
        message: "Doctor is not available !!!",
      });
    }

    const appointmentDay = doctor.schedule.find(
      (time) => time.day == dayOfWeek
    );
    console.log("appointmentDay", appointmentDay);
    if (!appointmentDay) {
      return res.status(200).send({
        status: false,
        message: "Doctor is not available this day!!!",
      });
    }

    const appointments = await Appointment.aggregate([
      {
        $match: {
          doctor: doctor._id,
          status: { $in: [1, 2] },
          date: req.query.date,
        },
      },
    ]);

    const timeSlots = [].concat(
      ...appointments.map((appointment) => appointment.time)
    );
    const busyDoctor = await DoctorBusy.findOne({
      doctor: doctor._id,
      date: req.query.date,
    });
    const mergedTimeSlots = busyDoctor
      ? [...timeSlots, ...busyDoctor.time]
      : timeSlots;

    return res.status(200).send({
      status: true,
      message: "success",
      data: mergedTimeSlots,
      appointmentDay,
      isOpen: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    if (!req.query.appointmentId) {
      return res.status(200).send({
        status: false,
        message: "Invalid Details",
      });
    }

    const appointment = await Appointment.findById(
      req.query.appointmentId
    ).populate("user", "name image email phone address city state country ").populate('doctor','latitude longitude')
    if (!appointment) {
      return res.status(200).send({
        status: false,
        message: "appointment not found",
      });
    }
    return res.status(200).send({
      status: true,
      message: "Success",
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
