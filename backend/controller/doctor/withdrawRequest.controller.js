const WithdrawRequest = require("../../models/withdrawRequest.model");
const Doctor = require("../../models/doctor.model");
const setting = require("../../setting");
exports.createWithdrawRequest = async (req, res) => {
  try {
    const { doctorId, amount, type } = req.query;
    if (!doctorId || !amount || !type) {
      return res
        .status(200)
        .send({ status: false, message: "DoctorId is required" });
    }
    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    });

    if (amount < setting.minWithdraw) {
      return res.status(200).send({
        status: false,
        message: `Minimum withdraw amount is ${setting.minWithdraw}`,
      });
    }

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

    if (req.query.amount > doctor.wallet) {
      return res.status(200).send({
        status: false,
        message: "You can not withdraw more than your current wallet amount",
      });
    }
    const existingRequest = await WithdrawRequest.findOne({
      doctor: doctor._id,
      status: 1,
    });
    if (existingRequest) {
      return res.status(200).send({
        status: false,
        message:
          "You cannot make new withdraw request until existing one is in process",
      });
    }

    const request = new WithdrawRequest();
    request.doctor = doctor._id;
    request.amount = parseInt(amount);
    request.type = parseInt(type);
    if (type == 1) request.bankDetails = doctor.bankDetails;
    if (type == 2) request.upiId = doctor.upiId;

    await request.save();
    const newRequest = await WithdrawRequest.findById(request._id).populate(
      "doctor"
    );

    await Promise.all([
      WithdrawRequest.findOneAndDelete({ doctor: doctor._id, status: 3 }),
      Doctor.updateOne({ _id: doctor._id }, { $inc: { wallet: -amount } }),
    ]);
    return res.status(200).send({
      status: true,
      message: "Withdraw request send to admin successfully",
      data: newRequest,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.get = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 20;
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";
    const skip = start * limit;

    if (!req.query.doctorId) {
      return res
        .status(200)
        .send({ status: false, message: "DoctorId is required" });
    }
    const doctor = await Doctor.findOne({
      _id: req.query.doctorId,
      isDelete: false,
    });

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

    let dateFilter = {};
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        payDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const request = await WithdrawRequest.aggregate([
      {
        $match: { status: 2, doctor: doctor._id, ...dateFilter },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                image: 1,
              },
            },
          ],
          as: "doctor",
        },
      },
      {
        $unwind: "$doctor",
      },
      { $sort: { payDate: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return res
      .status(200)
      .send({ status: true, message: "Success", data: request });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
