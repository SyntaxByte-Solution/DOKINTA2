const Doctor = require("../../models/doctor.model");
const DoctorBusy = require("../../models/doctorBusy.model");
const Holiday = require("../../models/doctorHoliday.model");


exports.doctorHoliday = async (req, res) => {
  try {
    const start = req.query.start || 0;
    const limit = req.query.limit || 10;
    const skipAmount = start * limit;
    let holiday;
    let total;

    if (req.query.doctorId === "All") {
      holiday = await Holiday.find({})
        .skip(skipAmount)
        .limit(limit)
        .populate("doctor", "name _id uniqueId");
      total = await Holiday.countDocuments({});
    } else {
      const doctor = await Doctor.findById({ _id: req.query.doctorId });
      if (!doctor) {
        return res
          .status(200)
          .json({ status: false, message: "Doctor not found" });
      }
      holiday = await Holiday.find({ doctor: doctor._id })
        .populate("doctor", "name _id uniqueId")
        .skip(skipAmount)
        .limit(limit);
      total = await Holiday.countDocuments({ doctor: doctor._id });
    }

    return res
      .status(200)
      .json({ status: true, message: "Success", data: holiday, total });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.query.id) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }

    const doctorBusy = await DoctorBusy.findById(req.query.id);
    if (!doctorBusy) {
      return res
        .status(200)
        .send({ status: false, message: "Doctor Busy Not Exist" });
    }
    await doctorBusy.deleteOne();
    return res
      .status(200)
      .send({ status: true, message: "Doctor Busy deleted successfully" });
  } catch {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
