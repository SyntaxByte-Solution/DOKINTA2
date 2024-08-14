const Doctor = require("../../models/doctor.model");
const DoctorBusy = require("../../models/doctorBusy.model");
const Holiday = require("../../models/doctorHoliday.model");
const moment = require("moment");



exports.busyDoctor = async (req, res, next) => {
  try {
    const doctorId = req.query.doctorId;
    const { date, time } = req.body;

    console.log("req.body",req.body);

    if (!doctorId || !date || !time) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });
    }

    let [doctor, existingBusyDoctor] = await Promise.all([
      Doctor.findOne({ _id: doctorId }),
      DoctorBusy.findOne({ doctor: doctorId, date }),
    ]);

    if (!doctor) {
      return res
        .status(200)
        .json({ status: false, message: "doctor not found" });
    }

    const timeArray = time.split(",").map((trimmedTime) => trimmedTime.trim());


    
    if (!existingBusyDoctor) {
      existingBusyDoctor = new DoctorBusy({
        doctor: doctor._id,
        date,
        time: [],
      });
    }


    timeArray.forEach((slot) => {
      if (!existingBusyDoctor.time.includes(slot)) {
        existingBusyDoctor.time.push(slot);
      }
    });

    await existingBusyDoctor.save();

    return res.status(200).json({
      status: true,
      message: "Busy schedule updated successfully",
      data: existingBusyDoctor
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};


exports.addHoliday = async (req, res) => {
  try {
    if (!req.body.startDate || !req.query.doctorId || !req.body.endDate) {
      return res
        .status(200)
        .send({ status: false, message: "Oops! Invalid details!" });
    }

    const doctor = await Doctor.findById(req.query.doctorId);
    if (!doctor) {
      return res
        .status(200)
        .json({ status: false, message: "Oops! doctor not found!" });
    }

    const startDate = moment(req.body.startDate).format('YYYY-MM-DD');
    const endDate = moment(req.body.endDate).format('YYYY-MM-DD');

    const datesToAdd = [];
    const currentDate = moment(startDate);
    while (currentDate <= moment(endDate)) {
      datesToAdd.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'days');
    }

    for (const dateToAdd of datesToAdd) {
      const alreadyHoliday = await Holiday.findOne({
        date: dateToAdd,
        doctor: doctor._id,
      });

      if (alreadyHoliday) {
        return res.status(200).send({
          status: false,
          message: `Date ${dateToAdd} is already added as a holiday`,
        });
      }
    }

    const addedHolidays = [];
    for (const dateToAdd of datesToAdd) {
      const holiday = new Holiday();
      holiday.date = dateToAdd;
      holiday.reason = req.body.reason || null;
      holiday.doctor = doctor._id;
      await holiday.save();
      addedHolidays.push(holiday);
    }

    return res.status(200).send({
      status: true,
      message: "Holiday added successfully!!",
      data:addedHolidays,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!",
    });
  }
};
