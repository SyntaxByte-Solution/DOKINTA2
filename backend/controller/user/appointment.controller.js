const Appointment = require("../../models/appointment.model");
const Doctor = require("../../models/doctor.model");
const setting = require("../../setting");
const User = require("../../models/user.model");
const Service = require("../../models/service.model");
const Holiday = require("../../models/doctorHoliday.model");
const DoctorBusy = require("../../models/doctorBusy.model");
const Wallet = require("../../models/userWallet.model");
const Coupon = require("../../models/coupon.model");
const SubPatient = require("../../models/subPatient.model");
const WalletHistory = require("../../models/userWalletHistory.model");
const UString = require("../../models/uniqueString.model");
const Notification = require("../../models/notification.model");
const admin = require("../../firebase");
const mongoose = require("mongoose");
const moment = require("moment");

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

exports.checkSlot = async (req, res) => {
  console.log("req.body", req.body);
  try {
    const {
      serviceId,
      userId,
      doctorId,
      date,
      time,
      amount,
      withoutTax,
      paymentGateway,
      duration,
      type,
    } = req.body;

    if (
      !serviceId ||
      !userId ||
      !doctorId ||
      !date ||
      !time ||
      !amount ||
      !withoutTax ||
      !paymentGateway ||
      !duration ||
      !type
    ) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details!!" });
    }

    const [user, doctor,  service, wallet] = await Promise.all([
      User.findOne({ _id: userId }),
      Doctor.findOne({ _id: doctorId }),
      Service.findOne({ _id: serviceId, status: true }),
      Wallet.findOne({ user: userId }),
    ]);

    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }
    if (user.isBlock) {
      return res.status(200).send({
        status: false,
        message: "User is blocked. Please contact admin",
      });
    }
    if (!wallet) {
      return res
        .status(200)
        .send({ status: false, message: "User wallet data not found" });
    }
    console.log("wallet", wallet);
    if (wallet.amount < amount) {
      return res.status(200).send({
        status: false,
        message: "Insufficient fund to book this appointment",
      });
    }

    if (!doctor || doctor.isBlock) {
      return res
        .status(200)
        .send({ status: false, message: "doctor not found" });
    }

    if (!service) {
      return res
        .status(200)
        .send({ status: false, message: "Service not found" });
    }

    const isTimeAlreadyBooked = await Appointment.exists({
      $and: [
        { date: date },
        { doctor: doctor._id },
        { status: { $eq: 1 } },
        {
          time: {
            $eq: time,
          },
        },
      ],
    });

    if (isTimeAlreadyBooked) {
      return res.status(200).send({
        status: false,
        message: `Selected time slot is already booked for Date ${
          req.body.date
        } for Doctor ${" " + doctor.name}`,
      });
    }

    const isValidService = doctor.service.includes(serviceId.trim());
    if (!isValidService) {
      return res.status(200).send({
        status: false,
        message: "Selected service is not valid for the doctor",
      });
    }

    const appointmentDay = moment(date, "YYYY-MM-DD");
    const dayOfWeek = appointmentDay.format("dddd");

    const doctorTime = doctor.schedule.find((time) => time.day == dayOfWeek);

    if (!doctorTime) {
      return res.status(200).send({
        status: false,
        message: "Doctor is not available on selected day",
      });
    }

    const doctorOpenTime = moment(doctorTime.startTime, "hh:mm A");
    const doctorCloseTime = moment(doctorTime.endTime, "hh:mm A");

    const breakStartTime = moment(doctorTime.breakStartTime, "hh:mm A");
    const breakEndTime = moment(doctorTime.breakEndTime, "hh:mm A");

    const appointmentStartTime = moment(time, "hh:mm A");

    const isWithinDoctorHours =
      appointmentStartTime.isSameOrAfter(doctorOpenTime) &&
      appointmentStartTime.isSameOrBefore(doctorCloseTime);

    const isDuringBreak =
      appointmentStartTime.isSameOrAfter(breakStartTime) &&
      appointmentStartTime.isSameOrBefore(breakEndTime);

    if (!isWithinDoctorHours || isDuringBreak) {
      return res.status(200).send({
        status: false,
        message:
          "Selected time slot is outside the doctor's working hours or during a break",
      });
    }

    if (doctor.type == 1 && type == 2) {
      return res.status(200).send({
        status: false,
        message: `Selected doctor do not provide on clinic service.select online option to book appoint with ${doctor.name}`,
      });
    }

    if (doctor.type == 2 && type == 1) {
      return res.status(200).send({
        status: false,
        message: `Selected doctor do not provide online service.select clinic option to book appoint with ${doctor.name}`,
      });
    }
    if (type !== 1 && type !== 2 && type !== 3) {
      return res.status(200).send({
        status: false,
        message: `Invalid service type`,
      });
    }
    const validWithoutTax = withoutTax == doctor.charge;
    if (!validWithoutTax) {
      return res.status(200).send({
        status: false,
        message: "Invalid service amount",
      });
    }

    const taxAmount = parseFloat((setting.tax * withoutTax) / 100);
    const totalAmount = parseFloat(withoutTax) + parseFloat(taxAmount);
    const validFinalAmount = totalAmount == amount;

    if (!validFinalAmount) {
      return res.status(200).send({
        status: false,
        message: "Invalid total amount",
      });
    }

    const validDuration = doctor.schedule[0].time === duration;

    if (!validDuration) {
      return res.status(200).send({
        status: false,
        message: "Invalid duration for appointment",
      });
    }
    return res.status(200).send({
      status: true,
      message: "Slots Checked Successfully for book appointment!!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.bookAppointment = async (req, res) => {
  console.log("req.body", req.body);
  try {
    const {
      serviceId,
      userId,
      doctorId,
      date,
      time,
      amount,
      withoutTax,
      duration,
      type,
      patient,
      details,
    } = req.body;

    if (
      !serviceId ||
      !userId ||
      !doctorId ||
      !date ||
      !time ||
      !amount ||
      !withoutTax ||
      !duration ||
      !type ||
      !patient
    ) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details!!" });
    }
    const today = moment().format("YYYY-MM-DD");

    const uniqueString = new UString({
      string: today + "-" + doctorId + "-" + time,
    });

    console.log("uniqueString", uniqueString);

    const [user, doctor,  service, wallet] = await Promise.all([
      User.findOne({ _id: userId }),
      Doctor.findOne({ _id: doctorId }),
      Service.findOne({ _id: serviceId, status: true }),
      Wallet.findOne({ user: userId }),
    ]);

    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }
    if (user.isBlock) {
      return res.status(200).send({
        status: false,
        message: "User is blocked. Please contact admin",
      });
    }
    if (!wallet) {
      return res
        .status(200)
        .send({ status: false, message: "User wallet data not found" });
    }

    if (wallet.amount < amount) {
      return res.status(200).send({
        status: false,
        message: "Insufficient fund to book this appointment",
      });
    }

    if (!doctor || doctor.isBlock) {
      return res
        .status(200)
        .send({ status: false, message: "doctor not found" });
    }

    if (!service) {
      return res
        .status(200)
        .send({ status: false, message: "Service not found" });
    }

    let subPatient;
    if (patient !== "self") {
      const patientId = new mongoose.Types.ObjectId(patient);
      subPatient = await SubPatient.findById(patientId);

      if (!subPatient) {
        return res
          .status(200)
          .send({ status: false, message: "Patient not found" });
      }

      if (!subPatient.user.equals(user._id)) {
        return res.status(200).send({
          status: false,
          message: "Patient not found in user profile",
        });
      }
    }

    const isTimeAlreadyBooked = await Appointment.exists({
      $and: [
        { date: date },
        { doctor: doctor._id },
        { status: { $eq: 1 } },
        {
          time: {
            $eq: time,
          },
        },
      ],
    });

    if (isTimeAlreadyBooked) {
      return res.status(200).send({
        status: false,
        message: `Selected time slot is already booked for Date ${
          req.body.date
        } for Doctor ${" " + doctor.name}`,
      });
    }

    const isValidService = doctor.service.includes(serviceId);
    console.log("isValidService", isValidService);
    console.log("doctor.service", doctor.service);
    console.log("serviceId", serviceId);
    if (!isValidService) {
      return res.status(200).send({
        status: false,
        message: "Selected service is not valid for the doctor",
      });
    }

    const appointmentDay = moment(date, "YYYY-MM-DD");
    const dayOfWeek = appointmentDay.format("dddd");

    const doctorTime = doctor.schedule.find((time) => time.day == dayOfWeek);

    if (!doctorTime) {
      return res.status(200).send({
        status: false,
        message: "Doctor is not available on selected day",
      });
    }

    const doctorOpenTime = moment(doctorTime.startTime, "hh:mm A");
    const doctorCloseTime = moment(doctorTime.endTime, "hh:mm A");

    const breakStartTime = moment(doctorTime.breakStartTime, "hh:mm A");
    const breakEndTime = moment(doctorTime.breakEndTime, "hh:mm A");

    const appointmentStartTime = moment(time, "hh:mm A");

    const isWithinDoctorHours =
      appointmentStartTime.isSameOrAfter(doctorOpenTime) &&
      appointmentStartTime.isSameOrBefore(doctorCloseTime);

    const isDuringBreak =
      appointmentStartTime.isSameOrAfter(breakStartTime) &&
      appointmentStartTime.isSameOrBefore(breakEndTime);

    if (!isWithinDoctorHours || isDuringBreak) {
      return res.status(200).send({
        status: false,
        message:
          "Selected time slot is outside the doctor's working hours or during a break",
      });
    }

    if (doctor.type == 1 && type == 2) {
      return res.status(200).send({
        status: false,
        message: `Selected doctor do not provide on clinic service.select online option to book appoint with ${doctor.name}`,
      });
    }

    if (doctor.type == 2 && type == 1) {
      return res.status(200).send({
        status: false,
        message: `Selected doctor do not provide online service.select clinic option to book appoint with ${doctor.name}`,
      });
    }
    if (type != 1 && type != 2 && type != 3) {
      return res.status(200).send({
        status: false,
        message: `Invalid service type`,
      });
    }

    const validDuration = parseInt(doctor.timeSlot) == parseInt(duration);

    if (!validDuration) {
      return res.status(200).send({
        status: false,
        message: "Invalid duration for appointment",
      });
    }
    const todayDate = moment().format("YYYY-MM-DD");
    let coupon;
    let discountAmount;
    if (req.body.coupon) {
      coupon = await Coupon.findOne({
        type: 2,
        code: req.body.coupon,
        isActive: true,
        // minAmountToApply: { $lte: amount },
        expiryDate: { $gte: todayDate },
        user: { $nin: [userId] },
      });

      if (coupon) {
        if (coupon.type === 2) {
          if (coupon.discountType === 1) {
            discountAmount = coupon.maxDiscount;
          }
          if (coupon.discountType === 2) {
            discountAmount = (amount * coupon.discountPercent) / 100;
            if (discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          }
        } else {
          return res.status(200).send({
            status: false,
            message: "This coupon is not valid for you right now",
          });
        }
      } else {
        return res.status(200).send({
          status: false,
          message: "Coupon is not found or you are not eligible for it",
        });
      }
    }

    const validWithoutTax = withoutTax == doctor.charge;
    if (!validWithoutTax) {
      return res.status(200).send({
        status: false,
        message: "Invalid service amount",
      });
    }

    let totalAmount;
    let validFinalAmount;
    let adminEarning;

    const doctorEarning =
      parseFloat(withoutTax) -
      ((doctor.commission * withoutTax) / 100).toFixed(2);

    const tax = parseFloat((setting.tax * withoutTax) / 100);

    if (coupon) {
      totalAmount = parseFloat(withoutTax) + parseFloat(tax) - discountAmount;

      adminEarning = (
        (doctor.commission * withoutTax) / 100 -
        discountAmount
      ).toFixed(2);

      coupon.user.push(userId);
      await coupon.save();
    } else {
      totalAmount = parseFloat(withoutTax) + parseFloat(tax);
      validFinalAmount = totalAmount == amount;

      console.log("totalAmount", totalAmount);
      console.log("amount", amount);

      if (!validFinalAmount) {
        return res.status(200).send({
          status: false,
          message: "Invalid total amount",
        });
      }

      adminEarning = ((doctor.commission * withoutTax) / 100).toFixed(2);
    }

    const adminCommissionPercent = doctor.commission;

    const imagePaths = req.files?.image?.map((file) => file.path);
    const [
      appointment,
      updatedDoctor,
      updatedWallet,
      userNotification,
      doctorNotification,
    ] = await Promise.all([
      Appointment.create({
        user: user._id,
        doctor: doctor._id,
        date,
        time,
        duration,
        amount: totalAmount,
        tax,
        withoutTax,
        type,
        doctorEarning,
        adminEarning,
        adminCommissionPercent,
        appointmentId: await generateUniqueBookingId(),
        service: service._id,
        patient: subPatient && subPatient._id,
        details,
        image: process.env.baseURL + imagePaths,
        discount: discountAmount,
        coupon: coupon && coupon.code,
      }),
      Doctor.updateOne(
        { _id: doctorId },
        {
          $inc: {
            bookingCount: 1,
            currentBookingCount: 1,
            wallet: doctorEarning,
            totalWallet: doctorEarning,
          },
        }
      ),
      Wallet.updateOne(
        { user: userId },
        {
          $inc: {
            amount: -amount,
          },
        }
      ),

      Notification.create({
        user: user._id,
        type: 1,
        message: `Appointment booked with ${doctor.name}  at ${req.body.time} on date ${req.body.date}`,
        date: moment().format("YYYY-MM-DD"),
        date: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        title: "Appointment booked ✅ ",
      }),
      Notification.create({
        user: doctor._id,
        type: 2,
        message: `Appointment booked with ${user.name} at ${req.body.time} on date ${req.body.date}`,
        date: moment().format("YYYY-MM-DD"),
        date: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        title: "Hey doctor,New appointment ✅",
      }),
    ]);

    const userPayload = {
      token: user.fcmToken,
      notification: {
        body: userNotification.message,
        title: userNotification.title,
      },
    };

    const doctorPayload = {
      token: doctor.fcmToken,
      notification: {
        body: doctorNotification.message,
        title: doctorNotification.title,
      },
    };

    const walletHistory = new WalletHistory();

    walletHistory.amount = amount;
    walletHistory.type = 2;
    walletHistory.appointment = appointment._id;
    walletHistory.date = moment().format("YYYY-MM-DD");
    walletHistory.appointment = appointment._id;
    walletHistory.user = user._id;
    walletHistory.time = moment().format("HH:MM a");
    walletHistory.uniqueId = await generateId();

    const adminPromise = await admin
    if (user && user.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(userPayload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    if (user && user.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(doctorPayload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }
    await Promise.all([walletHistory.save(), uniqueString.save()]);

    return res.status(200).send({
      status: true,
      message: "appointment send successfully!!",
      data: appointment,
      walletHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
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
    appointment.cancel.person = 1;
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

exports.rescheduleAppointment = async (req, res) => {
  try {
    if (!req.body.appointmentId || !req.body.date || !req.body.time) {
      return res
        .status(200)
        .send({ status: false, message: "Oops Invalid Details!!" });
    }
    const type = req.body.type;

    const appointment = await Appointment.findById(req.body.appointmentId);
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

    const doctor = await Doctor.findById(appointment.doctor);
    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "user not found!" });
    }

    const isTimeAlreadyBooked = await Appointment.exists({
      $and: [
        { date: req.body.date },
        { doctor: doctor._id },
        { status: { $eq: 1 } },
        {
          time: {
            $eq: req.body.time,
          },
        },
      ],
    });

    if (isTimeAlreadyBooked) {
      return res.status(200).send({
        status: false,
        message: `Selected time slot is already booked for Date ${
          req.body.date
        } for Doctor ${" " + doctor.name}`,
      });
    }

    const appointmentDay = moment(req.body.date, "YYYY-MM-DD");
    const dayOfWeek = appointmentDay.format("dddd");

    const doctorTime = doctor.schedule.find((time) => time.day == dayOfWeek);

    if (!doctorTime) {
      return res.status(200).send({
        status: false,
        message: "Doctor is not available on selected day",
      });
    }

    const doctorOpenTime = moment(doctorTime.startTime, "hh:mm A");
    const doctorCloseTime = moment(doctorTime.endTime, "hh:mm A");

    const breakStartTime = moment(doctorTime.breakStartTime, "hh:mm A");
    const breakEndTime = moment(doctorTime.breakEndTime, "hh:mm A");

    const appointmentStartTime = moment(req.body.time, "hh:mm A");

    const isWithinDoctorHours =
      appointmentStartTime.isSameOrAfter(doctorOpenTime) &&
      appointmentStartTime.isSameOrBefore(doctorCloseTime);

    const isDuringBreak =
      appointmentStartTime.isSameOrAfter(breakStartTime) &&
      appointmentStartTime.isSameOrBefore(breakEndTime);

    if (!isWithinDoctorHours || isDuringBreak) {
      return res.status(200).send({
        status: false,
        message:
          "Selected time slot is outside the doctor's working hours or during a break",
      });
    }

    if (doctor.type == 1 && type == 2) {
      return res.status(200).send({
        status: false,
        message: `Selected doctor do not provide on clinic service.select online option to book appoint with ${doctor.name}`,
      });
    }

    if (doctor.type == 2 && type == 1) {
      return res.status(200).send({
        status: false,
        message: `Selected doctor do not provide online service.select clinic option to book appoint with ${doctor.name}`,
      });
    }
    if (type != 1 && type != 2 && type != 3) {
      return res.status(200).send({
        status: false,
        message: `Invalid service type`,
      });
    }

    appointment.time = req.body.time;
    appointment.date = req.body.date;
    appointment.type = req.body.type
      ? parseInt(req.body.type)
      : appointment.type;
    await appointment.save();

    return res
      .status(200)
      .send({ status: true, message: "Success", data: appointment });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.isCallEnableForUser = async (req, res) => {
  try {
    const { doctorId, userId } = req.query;

    if (!doctorId || !userId) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details" });
    }

    const [user, doctor] = await Promise.all([
      User.findById(userId),
      Doctor.findOne({ _id: doctorId, isBlock: false }),
    ]);

    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: "user not found!" });
    }

    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "doctor not found!" });
    }
    const today = moment().format("YYYY-MM-DD");
    const data = await Appointment.find({
      status: 1,
      doctor: doctor._id,
      user: user._id,
      date: today,
    });

    if (data.length > 0) {
      return res
        .status(200)
        .send({ status: true, message: "Success", callEnable: true });
    }
    if (data.length == 0) {
      return res
        .status(200)
        .send({ status: true, message: "Success", callEnable: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.getTax = async (req, res) => {
  try {
    const amount = req.query.amount;
    if (!amount)
      return res
        .status(200)
        .send({ status: false, message: "amount is required" });

    const tax = (amount * setting.tax) / 100;
    const taxPercent = setting.tax;
    const finalAmount = parseFloat(amount) + parseFloat(tax);
    const data = {
      tax,
      taxPercent,
      finalAmount,
    };
    return res.status(200).send({ status: true, message: "Success", data });
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
    ).populate(
      "doctor",
      "name image name designation address clinicName degree latitude longitude"
    );
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

exports.getParticularUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.status) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Details" });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).send({ status: false, message: "User Not Found" });
    }

    let status;
    if (req.query.status === "ALL") {
      status = "ALL";
    } else {
      status = parseInt(req.query.status);
    }

    if (status != "ALL" && status != 1 && status != 3 && status != 4) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid Appointment Type" });
    }

    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = start * limit;

    const appointments = await Appointment.aggregate([
      {
        $match: {
          ...getStatusFilter(status),
          ...dateFilter,
          user: user._id,
        },
      },
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
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
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
          doctor: { _id: 1, name: 1, image: 1, designation: 1, degree: 1 },
          paymentStatus: 1,
          appointmentId: 1,
          adminEarning: 1,
          amount: 1,
          withoutTax: 1,
          cancel: 1,
          doctorEarning: 1,
          type: 1,
          isReviewed: 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await Appointment.countDocuments({
      ...getStatusFilter(status),
      ...dateFilter,
      user: req.query.userId,
    });

    return res
      .status(200)
      .send({ status: true, message: "Success", total, data: appointments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

async function generateUniqueBookingId() {
  let newAppointmentId;

  do {
    newAppointmentId = Math.floor(Math.random() * 1000000 + 999999);
  } while (await Appointment.exists({ appointmentId: newAppointmentId }));

  return newAppointmentId;
}

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

async function generateId() {
  let newId;

  do {
    newId = Math.floor(Math.random() * 1000000 + 999999);
  } while (await WalletHistory.exists({ uniqueId: newId }));

  return newId;
}
