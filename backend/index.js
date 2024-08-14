require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5047;
const moment = require("moment");
var logger = require("morgan");
const path = require("path");
const cron = require("node-cron");
app.use(express.json());

app.use(cors());
app.use(logger("dev"));
require("./middleware/mongodb");
const Doctor = require('./models/doctor.model')
const Attendance = require('./models/attendance.model')
const Setting = require('./models/setting.model')

const settingJson = require("./setting");

//Declare global variable
global.settingJSON = {};

//handle global.settingJSON when pm2 restart
async function initializeSettings() {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (setting) {
      console.log("In setting initialize Settings");
      global.settingJSON = setting;
    } else {
      global.settingJSON = settingJson;
    }
  } catch (error) {
    console.error("Failed to initialize settings:", error);
  }
}

module.exports = initializeSettings();

//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  const settingJSON = JSON.stringify(settingData, null, 2);
  fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");

  global.settingJSON = settingData; // Update global variable
  console.log("Settings file updated.");
};


async function updateAttendance(doctorId, action) {
  try {
    const todayDate = moment().format("YYYY-MM-DD");

    let attendanceRecord = await Attendance.findOne({
      doctor: doctorId,
      month: moment().format("YYYY-MM"),
    }).populate("doctor");

    const doctor = await Doctor.findById(doctorId);

    let savedAttendance;

    if (!attendanceRecord) {
      attendanceRecord = new Attendance();
      attendanceRecord.doctor = doctor._id;
      attendanceRecord.month = moment().format("YYYY-MM");
    }

    const dateIndex = attendanceRecord.attendDates.indexOf(todayDate);
    const absentIndex = attendanceRecord.absentDates.indexOf(todayDate);

    if (action == 2) {
      if (absentIndex !== -1 || dateIndex !== -1) {
        console.log(
          `Attendance for today has already been marked for ${doctor.name}`
        );
        return;
      }

      if (dateIndex !== -1) {
        attendanceRecord.attendCount -= 1;
        attendanceRecord.attendDates.splice(dateIndex, 1);
      }

      attendanceRecord.absentCount += 1;
      attendanceRecord.absentDates.push(todayDate);
    }

    attendanceRecord.totalDays =
      attendanceRecord.attendCount + attendanceRecord.absentCount;

    doctor.isAttend = false;

    await doctor.save();

    savedAttendance = await attendanceRecord.save();

    console.log(
      `Absent
       marked successfully for ${doctor.name}`
    );
  } catch (error) {
    console.log("error", error);
  }
}

// Expert who are not attend are count as absent for the day
cron.schedule("50 23 * * *", async () => {
  try {
    const allDoctors = await Doctor.find({ isDelete: false });

    // Iterate through each expertId and call the API with action 'absent'
    for (const doctor of allDoctors) {
      const doctorId = doctor._id;

      // Call the API for each expert with action 'absent'
      await updateAttendance(doctorId, 2);
    }

    const doctor = await Doctor.updateMany({ isAttend: false });
 
    console.log("Cron job executed successfully.");
  } catch (error) {
    console.error("Error executing cron job:", error);
  }
});


const indexRoute = require("./route/index");
app.use(indexRoute);

//socket io
const http = require("http");
const server = http.createServer(app);
global.io = require("socket.io")(server);

//socket.js
require("./socket");

app.use("/storage", express.static(path.join(__dirname, "storage")));


server.listen(port, () => {
  console.log(`magic happen on ${port} `);
})

