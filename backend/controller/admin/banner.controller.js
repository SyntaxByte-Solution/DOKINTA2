const Banner = require("../../models/banner.model");
const Service = require("../../models/service.model");
const { deleteFile } = require('../../middleware/deleteFile')
const moment  = require('moment')


// create banner
exports.create = async (req, res) => {
  try {
      if (!req.file || !req.body.type) {
        if (req.files) deleteFile(req.files);
      return res
        .status(200)
        .send({ status: false, message: "Oops ! Invalid details!!" });
    }
    
    const banner = new Banner();
    banner.image = req.file ? process?.env?.baseURL + req?.file?.path : "";
    if (req.body.type == 1) {
      if (!req.body.serviceId) {
        if (req.files) deleteFile(req.files);
        return res
        .status(200)
          .send({ status: false, message: "Oops ! Invalid details!!" });
        }
      const service = await Service.findById(req.body.serviceId)
      if (!service) {
        if (req.files) deleteFile(req.files);
        return res
        .status(200)
          .send({ status: false, message: "Oops ! Category Not Found!!" });
      }
      banner.type = 1;
      banner.service = service._id

    }else if (req.body.type == 2) {
      if (!req.body.url) {
        if (req.files) deleteFile(req.files);
        return res
        .status(200)
        .send({ status: false, message: "Oops ! Url Is Required!!" });
      }
      banner.type = 2;
      banner.url = req.body.url;
    }else {
      return res
      .status(200)
      .send({ status: false, message: "Invalid Type!!" });
    }
    await banner.save();
    return res.status(200).send({
      status: true,
      message: "Success!",
      banner,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

// handle active banner means banner is active or not for app
exports.isActive = async (req, res) => {
    try {
      if (!req.query.bannerId) {
        return res.status(200).send({ status: false, message: "Banner Not Found" });
      }
      const banner = await Banner.findById(req.query.bannerId);
      if (!banner) {
        return res
          .status(200)
          .send({ status: false, message: "Banner not exist" });
      }
      banner.isActive = !banner.isActive;
      await banner.save();
  
      return res
        .status(200)
        .send({ status: true, message: "isActive status changed", data:banner });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        error: error.message || "Internal Server Error!!",
      });
    }
  };
  

  // delete banner
  exports.deleteBanner =  async(req,res)=>{
    try {
        if (!req.query.bannerId) {
            return res.status(200).send({status:false,message:"Oops ! Invalid details!!"})
        }
        const banner = await Banner.findByIdAndDelete(req.query.bannerId)
        if (!banner) {  
            return res.status(200).send({status:false,message:"Banner is not Exist"})
        }
        return res.status(200).send({status:true,message:"banner Deleted Successfully"})
    } catch (error) {
        console.error(error);
        return res.status(500).json({
          status: false,
          error: error.message || "Internal Server Error",
        });
    }
}



// get all banner
exports.getAll = async (req, res) => {
    try {


      const data = await Banner.find().populate('service');
        return res
        .status(200)
        .send({ status: true, message: "Success", data });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
          status: false,
          error: error.message || "Internal Server Error",
        });
    }
}

