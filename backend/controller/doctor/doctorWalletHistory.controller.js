const DoctorWalletHistory = require("../../models/doctorWalletHistory.model");
const Doctor = require("../../models/doctor.model");

exports.get = async (req, res) => {
  try {
    if (!req.query.doctorId || !req.query.month) {
      return res
        .status(200)
        .send({ status: false, message: "DoctorId is required" });
    }

    let dateFilter = {
      month: {
        $eq: req.query.month,
      },
    };


    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;

    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    }).sort({ date: 1 });

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

    const data = await DoctorWalletHistory.aggregate([
      {
        $addFields: {
          month: { $substr: ["$date", 0, 7] },
        },
      },
      {
        $match: {
          doctor: doctor._id,
          ...dateFilter,
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $lookup: {
          from: "appointments",
          localField: "appointment",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                appointmentId: 1,
                date: 1,
                time: 1,
              },
            },
          ],
          as: "appointment",
        },
      },
      {
        $unwind: {
          path: "$appointment",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    return res.status(200).send({ status: true, message: "Success", data });
  } catch (error) {
    console.log(error);
    return res.status({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};
