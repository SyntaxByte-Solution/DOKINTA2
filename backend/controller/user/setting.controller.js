const setting = require("../../setting");

exports.get = async (req, res) => {
  try {
    const settingData = setting;
    return res.status(200).send({
      status: true,
      message: "success!!",
      setting: settingData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
