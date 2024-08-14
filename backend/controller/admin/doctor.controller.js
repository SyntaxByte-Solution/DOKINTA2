const Doctor = require("../../models/doctor.model");

exports.getAllDoctors = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;

    let matchQuery
    const searchString = req.query.search || "";
    if (req.query.search !== "ALL" && req.query.search !== "") {
      const searchRegex = new RegExp(searchString, "i");
      matchQuery = {
        $or: [
          { name: { $regex: searchString, $options: "i" } },
          { designation: { $regex: searchString, $options: "i" } },
          { email: { $regex: searchString, $options: "i" } },
          { clinicName: { $regex: searchString, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$mobile" },
                regex: searchRegex,
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$uniqueId" },
                regex: searchRegex,
              },
            },
          },
        ],
      };
    }

    const [data, total] = await Promise.all([
      Doctor.aggregate([
        {
          $match: { isDelete: false, ...matchQuery },
        },
        {
          $lookup: {
            from: "services",
            localField: "service",
            foreignField: "_id",
            as: "service",
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skipAmount,
        },
        {
          $limit: limit,
        },
      ]),
      Doctor.countDocuments({
        isDelete: false,
        ...matchQuery
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Data found",
      total,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getDoctorDropDown = async (req,res) => {
  try {

    const data = await Doctor.find({isDelete:false}).select("_id name")
    return res.status(200).json({status:true,message:"Success",data})
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
}

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

exports.blockUnblock = async (req, res) => {
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

    doctor.isBlock = !doctor.isBlock;
    await doctor.save();
    return res.status(200).send({
      status: true,
      message: "Doctor update successfully",
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


exports.delete = async (req, res) => {
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

    doctor.isDelete = true;
    await doctor.save();
    return res.status(200).send({
      status: true,
      message: "Doctor delete successfully",
    
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

    doctor.name = req.body.name ? req.body.name : doctor.name;
    doctor.age = req.body.age ? req.body.age : doctor.age;
    doctor.mobile = req.body.mobile ? req.body.mobile : doctor.mobile;
    doctor.gender = req.body.gender ? req.body.gender : doctor.gender;
    doctor.dob = req.body.dob ? req.body.dob : doctor.dob;
    doctor.country = req.body.country ? req.body.country : doctor.country;
    doctor.designation = req.body.designation
      ? req.body.designation
      : doctor.designation;
    doctor.service = req.body.service
      ? req.body.service.split(",")
      : doctor.service;
    doctor.degree = req.body.degree
      ? req.body.degree.split(",")
      : doctor.degree;
    doctor.language = req.body.language
      ? req.body.language.split(",")
      : doctor.language;
    doctor.experience = req.body.experience
      ? req.body.experience
      : doctor.experience;
    doctor.charge = req.body.charge ? req.body.charge : doctor.charge;
    doctor.type = req.body.type ? req.body.type : doctor.type;
    doctor.clinicName = req.body.clinicName
      ? req.body.clinicName
      : doctor.clinicName;
    doctor.address = req.body.address ? req.body.address : doctor.address;
    doctor.awards = req.body.awards
      ? req.body.awards.split(",")
      : doctor.awards;
    doctor.yourSelf = req.body.yourSelf ? req.body.yourSelf : doctor.yourSelf;
    doctor.education = req.body.education
      ? req.body.education
      : doctor.education;
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
      branchName: req.body.branchName || doctor.bankDetails.branchName

    }


      await doctor.save()

    return res.status(200).send({
      status: true,
      message: "Doctor found successfully",
      data:doctor
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

