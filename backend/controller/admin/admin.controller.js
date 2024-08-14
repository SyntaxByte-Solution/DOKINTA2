const Admin = require("../../models/admin.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Cryptr = require("cryptr");
const fs = require("fs");
const cryptr = new Cryptr("myTotallySecretKey", {
  pbkdf2Iterations: 10000,
  saltLength: 10,
});

exports.createAdmin = async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const admin = new Admin();

    admin.name = req.body.name;
    admin.email = req.body.email;
    admin.password = cryptr.encrypt(req.body.password);
    admin.image = process.env.baseURL + req.file.path;

    await admin.save();

    return res.status(200).json({
      status: true,
      message: "Admin Created Successfully!!",
      data:admin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    if (req.body.email && req.body.password) {
      const admin = await Admin.findOne({ email: req.body.email });

      if (!admin) {
        return res.status(200).json({
          status: false,
          message: "Oops ! email does not found!!",
        });
      }

      //match password
      const isPassword = cryptr.decrypt(admin.password);

      if (req.body.password !== isPassword) {
        return res.status(200).send({
          status: false,
          message: "Oops ! Password doesn't match",
        });
      }

      const payload = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        flag: admin.flag,
      };

      const key = process.env.JWT_SECRET;
      const token = jwt.sign(payload, key);

      if (admin) {
        return res.status(200).json({
          status: true,
          message: "Admin Login Successfully!!",
          data:token,
        });
      } else {
        return res
          .status(200)
          .json({ status: false, message: "Admin does not found!!" });
      }
    } else {
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error!!",
    });
  }
};


// get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res
        .status(200)
        .json({ status: false, message: "Admin does not Exist" });
    }
    return res.status(200).json({ status: true, message: "success", data:admin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//update admin profile
exports.update = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res
        .status(200)
        .send({ status: false, message: "admin not exists" });
    }

    if (req.file) {
      var image_ = admin.image.split("storage");
      if (image_[1] !== "/male.png" && image_[1] !== "/female.png") {
        if (fs.existsSync("storage" + image_[1])) {
          fs.unlinkSync("storage" + image_[1]);
        }
      }

      admin.image = req.file
        ? process?.env?.baseURL + req?.file?.path
        : admin.image;
    }

    admin.name = req.body.name ||admin.name;
    admin.email = req.body.email ||admin.email;

    await admin.save();

    return res.status(200).send({ status: true, message: "success!!", admin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: "Internal server error" || error });
  }
};
//update admin password
exports.updateAdminPassword = async (req, res) => {
  try {
    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res
        .status(200)
        .send({ status: false, message: "Invalid details" });
    }

    const admin = await Admin.findById(req.admin._id);
    if (cryptr.decrypt(admin.password) !== req.body.oldPass) {
      return res
        .status(200)
        .send({ status: false, message: "old password is Invalid" });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res
        .status(200)
        .send({ status: false, message: "password does not match" });
    }

    admin.password = cryptr.encrypt(req.body.newPass);
    await admin.save();
    return res
      .status(200)
      .send({ status: true, message: "password updated", admin });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, message: "Internal server error" || error });
  }
};
