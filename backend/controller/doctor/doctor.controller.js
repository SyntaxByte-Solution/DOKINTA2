const Doctor = require("../../models/doctor.model");

exports.login = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password ) {
      return res
        .status(200)
        .send({ status: false, message: "Oops Invalid Details" });
    }

    const doctor = await Doctor.findOne({
      email: req.body.email,
      password: req.body.password,
      isDelete: false,
    });
    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "doctor not found" });
    }

    if (doctor.isBlock) {
      return res
        .status(200)
        .json({ status: false, message: "You are blocked by admin!!" });
    }

    doctor.fcmToken = req?.body?.fcmToken
      ? req?.body?.fcmToken
      : doctor?.fcmToken;

    doctor.latitude = req.body.latitude || doctor.latitude;
    doctor.longitude = req.body.longitude || doctor.longitude;
    await doctor.save();
    return res.status(200).json({
      status: true,
      message: "finally, doctor login Successfully!!",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server error",
    });
  }
};

exports.getDoctorDetails = async (req, res) => {
  try {
    if (!req.query.doctorId) {
      return res
        .status(200)
        .send({ status: false, message: "DoctorId is required" });
    }
    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    }).populate("service");

    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "Doctor not found" });
    }

    if (doctor.isBlock) {
      return res.status(200).send({
        status: false,
        message: "Your are blocked by admin,contact admin for further details",
      });
    }

    return res.status(200).send({
      status: true,
      message: "Doctor found successfully",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.updateTime = async (req, res) => {
  try {
    if (!req.query.doctorId || !req.query.day) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid details" });
    }
    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    }).populate("service");
    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "Doctor not found" });
    }
    if (doctor.isBlock) {
      return res.status(200).send({
        status: false,
        message: "Your are blocked by admin,contact admin for further details",
      });
    }
    const weekDay = doctor.schedule.find((time) => time.day === req.query.day);

    weekDay.startTime = req.body.startTime
      ? req.body.startTime
      : weekDay.startTime;
    weekDay.endTime = req.body.endTime ? req.body.endTime : weekDay.endTime;
    weekDay.breakStartTime = req.body.breakStartTime
      ? req.body.breakStartTime
      : weekDay.breakStartTime;
    weekDay.breakEndTime = req.body.breakEndTime
      ? req.body.breakEndTime
      : weekDay.breakEndTime;

    weekDay.timeSlot = req.body.timeSlot ? req.body.timeSlot : weekDay.timeSlot;

    await doctor.save();
    return res.status(200).send({
      status: true,
      message: "Hospital schedule update successfully",
      data: doctor.schedule,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log("req.body", req.body);
    if (!req.query.doctorId) {
      if (req.file) deleteFile(req.file);
      return res
        .status(200)
        .send({ status: false, message: "DoctorId is required" });
    }
    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    }).populate("service");
    if (!doctor) {
      if (req.file) deleteFile(req.file);
      return res
        .status(200)
        .send({ status: false, message: "Doctor not found" });
    }

    if (doctor.isBlock) {
      if (req.file) deleteFile(req.file);
      return res.status(200).send({
        status: false,
        message: "Your are blocked by admin,contact admin for further details",
      });
    }

    doctor.name = req.body.name || doctor.name;
    doctor.age = req.body.age || doctor.age;
    doctor.mobile = req.body.mobile || doctor.mobile;
    doctor.gender = req.body.gender || doctor.gender;
    doctor.dob = req.body.dob || doctor.dob;
    doctor.country = req.body.country || doctor.country;
    doctor.designation = req.body.designation || doctor.designation;

    doctor.service = req.body.service
      ? req.body.service.split(",")
      : doctor.service;
    doctor.degree = req.body.degree
      ? req.body.degree.split(",")
      : doctor.degree;
    doctor.language = req.body.language
      ? req.body.language.split(",")
      : doctor.language;
    doctor.experience = req.body.experience || doctor.experience;
    doctor.charge = req.body.charge || doctor.charge;
    doctor.type = req.body.type || doctor.type;
    doctor.clinicName = req.body.clinicName || doctor.clinicName;
    doctor.address = req.body.address || doctor.address;
    doctor.awards = req.body.awards
      ? req.body.awards.split(",")
      : doctor.awards;
    doctor.yourSelf = req.body.yourSelf || doctor.yourSelf;
    doctor.education = req.body.education || doctor.education;

    doctor.expertise = req.body.expertise ? req.body.expertise.split(",") : doctor.expertise
    doctor.experienceDetails = req.body.experienceDetails
      ? req.body.experienceDetails.split(",")
      : doctor.experienceDetails;
    doctor.image = req.file
      ? process.env.baseURL + req.file.path
      : doctor.image;

    doctor.bankDetails = {
      bankName: req.body.bankName || doctor.bankDetails.bankName,
      accountNumber: req.body.accountNumber || doctor.bankDetails.accountNumber,
      IFSCCode: req.body.IFSCCode || doctor.bankDetails.IFSCCode,
      branchName: req.body.branchName || doctor.bankDetails.branchName,
    };

    await doctor.save();

    return res.status(200).send({
      status: true,
      message: "Doctor found successfully",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.updateBankDetails = async (req, res) => {
  try {
    if (!req.query.doctorId) {
      if (req.file) deleteFile(req.file);
      return res
        .status(200)
        .send({ status: false, message: "DoctorId is required" });
    }
    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    });

    if (!doctor) {
      if (req.file) deleteFile(req.file);
      return res
        .status(200)
        .send({ status: false, message: "Doctor not found" });
    }

    if (doctor.isBlock) {
      if (req.file) deleteFile(req.file);
      return res.status(200).send({
        status: false,
        message: "Your are blocked by admin,contact admin for further details",
      });
    }

    doctor.bankDetails.bankName =
      req.body.bankName || doctor.bankDetails.bankName;
    doctor.bankDetails.accountNumber =
      req.body.accountNumber || doctor.bankDetails.accountNumber;
    doctor.bankDetails.IFSCCode =
      req.body.IFSCCode || doctor.bankDetails.IFSCCode;
    doctor.bankDetails.branchName =
      req.body.branchName || doctor.bankDetails.branchName;
    doctor.bankDetails.image =
      req.file ? process.env.baseURL + req.file.path : doctor.bankDetails.image;
    doctor.bankDetails.name =
      req.body.name || doctor.bankDetails.name;
    doctor.upiId = req.body.upiId || doctor.upiId;
    doctor.paymentType = req.body.paymentType || doctor.paymentType;
    await doctor.save();
    return res.status(200).send({
      status: true,
      message: "Doctor bank details successfully",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
