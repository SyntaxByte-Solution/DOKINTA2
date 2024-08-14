const Doctor = require("../../models/doctor.model");
const Service = require("../../models/service.model");
const User = require("../../models/user.model");
const Appointment = require("../../models/appointment.model");

// exports.getFilteredDoctors = async (req, res) => {
//   try {
//     const { serviceId, rating, type, distance, userId, gender } = req.body;
//     const search = req.query.search || "";

//     console.log("req.body", req.body);
//     if (!userId) {
//       return res.status(200).json({
//         status: false,
//         message: "Oops ! Invalid details",
//       });
//     }
//     let service;
//     if (serviceId) {
//       service = await Service.findOne({ _id: serviceId, status: true });
//       if (!service) {
//         return res.status(404).json({
//           status: false,
//           message: "Service not available right now",
//         });
//       }
//     }

//     let genderQuery;
//     if (gender && gender !== "both") {
//       genderQuery = {
//         gender: gender,
//       };
//     }

//     let ratingQuery;
//     if (rating) {
//       ratingQuery = {
//         rating: { $gte: rating },
//       };
//     }

//     let searchQuery = {};
//     if (search && search !== "") {
//       searchQuery.name = { $regex: search, $options: "i" };
//     }

//     const [doctors, user] = await Promise.all([
//       Doctor.find({
//         ...(serviceId && { service: { $in: serviceId } }),
//         ...ratingQuery,
//         ...genderQuery,
//         ...searchQuery,
//       }).sort({ charge: 1 }),
//       User.findOne({ _id: userId }).select("_id doctors"),
//     ]);

//     let data = doctors;
//     if (doctors.length > 3 && type) {
//       const chunkSize = Math.ceil(doctors.length / 3);
//       const chunkedDoctors = [];
//       for (let i = 0; i < doctors.length; i += chunkSize) {
//         const chunk = doctors.slice(i, i + chunkSize);
//         chunkedDoctors.push(chunk);
//       }

//       switch (type) {
//         case 1:
//           data = chunkedDoctors[0];
//           break;
//         case 2:
//           data = chunkedDoctors[1];
//           break;
//         case 3:
//           data = chunkedDoctors[2];
//           break;
//         default:
//           data = doctors;
//           break;
//       }
//     }

//     const updatedDoctors = data.map((doc) => ({
//       ...doc.toObject(),
//       isSaved: user.doctors.some((savedDocId) => savedDocId.equals(doc._id)),
//     }));

//     const savedDoctor = user.toObject();
//     savedDoctor.doctors = updatedDoctors;
//     const total = updatedDoctors.length;

//     return res
//       .status(200)
//       .send({ status: true, message: "Success", total, data: updatedDoctors });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       status: false,
//       error: error.message || "Internal Server Error",
//     });
//   }
// };



exports.getFilteredDoctors = async (req, res) => {
  try {
    const { rating, type, distance, userId, gender } = req.body;
    const search = req.query.search || "";

    console.log("req.body", req.body);
    if (!userId) {
      return res.status(200).json({
        status: false,
        message: "Oops ! Invalid details",
      });
    }

    let genderQuery = {};
    if (gender && gender !== "both") {
      genderQuery = { gender: gender };
    }

    let ratingQuery = {};
    if (rating) {
      ratingQuery = { rating: { $gte: rating } };
    }

    let searchQuery = {};
    if (search && search !== "") {
      searchQuery.name = { $regex: search, $options: "i" };
    }

    const [services, user] = await Promise.all([
      Service.find({ status: true }).select('_id name'),
      User.findOne({ _id: userId }).select("_id doctors"),
    ]);

    if (!user) {
      return res.status(200).send({
        status: false,
        message: "Cannot fetch user right now"
      });
    }

    const serviceIds = services.map(service => service._id);
    const doctors = await Doctor.find({
      service: { $in: serviceIds },
      ...ratingQuery,
      ...genderQuery,
      ...searchQuery,
    }).sort({ charge: 1 });

    const doctorsByService = {};
    services.forEach(service => {
      doctorsByService[service._id] = [];
    });

    doctors.forEach(doctor => {
      doctor.service.forEach(serviceId => {
        if (doctorsByService[serviceId]) {
          doctorsByService[serviceId].push(doctor);
        }
      });
    });

    const updatedDoctorsByService = [];
    Object.keys(doctorsByService).forEach(serviceId => {
      let data = doctorsByService[serviceId];
      if (data.length > 3 && type) {
        const chunkSize = Math.ceil(data.length / 3);
        const chunkedDoctors = [];
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          chunkedDoctors.push(chunk);
        }

        switch (type) {
          case 1:
            data = chunkedDoctors[0];
            break;
          case 2:
            data = chunkedDoctors[1];
            break;
          case 3:
            data = chunkedDoctors[2];
            break;
          default:
            data = doctorsByService[serviceId];
            break;
        }
      }

      const updatedDoctors = data.map((doc) => ({
        ...doc.toObject(),
        isSaved: user?.doctors?.some((savedDocId) => savedDocId.equals(doc._id)),
      }));

      updatedDoctorsByService.push({
        serviceId: serviceId,  // Add this line to include the service ID
        serviceName: services.find(service => service._id.equals(serviceId)).name,
        doctors: updatedDoctors,
      });
    });

    console.log('user?.doctors', user)

    return res.status(200).send({
      status: true,
      message: "Success",
      data: updatedDoctorsByService,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};




exports.getDoctorDetails = async (req, res) => {
  try {
    if (!req.query.doctorId || !req.query.userId) {
      return res
        .status(200)
        .send({ status: false, message: "DoctorId is required" });
    }
    const [doctor, patients, user] = await Promise.all([
      Doctor.findOne({
        _id: req.query.doctorId,
        isDelete: false,
        isBlock: false,
      }).populate("service"),
      Appointment.aggregate([
        {
          $match: {
            doctorId: req.query.doctorId,
            status: 3,
          },
        },
        {
          $group: {
            _id: "$user.userId",
            count: { $sum: 1 },
          },
        },
        {
          $count: "count",
        },
      ]),
      User.findById(req.query.userId).select("doctors"),
    ]);

    if (!doctor) {
      return res
        .status(200)
        .send({ status: false, message: "Doctor not found" });
    }

    const isSaved = user && user.doctors.includes(doctor._id);

    return res.status(200).send({
      status: true,
      message: "Doctor found successfully",
      data: doctor,
      patients: patients[0]?.count || 0,
      isSaved,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const { userId, serviceId } = req.query;

    const [doctors, user] = await Promise.all([
      Doctor.find({
        isDelete: false,
        isBlock: false,
        service: { $in: serviceId },
      }),
      User.findOne({ _id: userId }).select("_id doctors"),
    ]);

    const updatedDoctors = doctors.map((doc) => ({
      ...doc.toObject(),
      isSaved: user.doctors.some((savedDocId) => savedDocId.equals(doc._id)),
    }));

    const savedDoctor = user.toObject();
    savedDoctor.doctors = updatedDoctors;

    return res.status(200).send({
      status: true,
      message: "Data found",
      data: savedDoctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.saveDoctor = async (req, res) => {
  try {
    const { userId, doctorId } = req.query;

    const [user, doctor] = await Promise.all([
      User.findOne({ _id: userId }),
      Doctor.findOne({ _id: doctorId }),
    ]);
    if (!user) {
      return res.status(200).json({
        status: false,
        message: "User not found",
      });
    }
    if (!doctor) {
      return res.status(200).json({
        status: false,
        message: "Doctor not found",
      });
    }

    if (user.doctors.includes(doctor._id)) {
      user.doctors.pull(doctor._id);
      await user.save();
      return res.status(200).json({
        status: true,
        message: "Doctor removed successfully",
      });
    } else {
      user.doctors.push(doctor._id);
      await user.save();
      return res.status(200).json({
        status: true,
        message: "Doctor saved successfully",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.searchDoctors = async (req, res) => {
  try {
    const search = req.query.search.trim();

    const doctors = await Doctor.find({
      name: { $regex: search, $options: "i" },
    });
    return res.status(200).send({ status: true, data: doctors });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.allSavedDoctors = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findOne({ _id: userId }).populate(
      "doctors",
      "name image designation degree rating clinicName"
    );
    if (!user) {
      return res.status(200).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).send({
      status: true,
      message: "success!!",
      data: user.doctors,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
