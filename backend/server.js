const express = require('express');
const serverless = require('serverless-http');
const app = express();
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
const moment = require('moment');
const cron = require('node-cron');
const fs = require('fs');

// Import your existing code and middleware
require('./middleware/mongodb');
const Doctor = require('./models/doctor.model');
const Attendance = require('./models/attendance.model');
const Setting = require('./models/setting.model');
const settingJson = require('./setting');

// Declare global variable
global.settingJSON = {};

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
        console.log(`Attendance for today has already been marked for ${doctor.name}`);
        return;
      }

      if (dateIndex !== -1) {
        attendanceRecord.attendCount -= 1;
        attendanceRecord.attendDates.splice(dateIndex, 1);
      }

      attendanceRecord.absentCount += 1;
      attendanceRecord.absentDates.push(todayDate);
    }

    attendanceRecord.totalDays = attendanceRecord.attendCount + attendanceRecord.absentCount;
    doctor.isAttend = false;

    await doctor.save();
    savedAttendance = await attendanceRecord.save();
    console.log(`Absent marked successfully for ${doctor.name}`);
  } catch (error) {
    console.log("error", error);
  }
}

cron.schedule("50 23 * * *", async () => {
  try {
    const allDoctors = await Doctor.find({ isDelete: false });
    for (const doctor of allDoctors) {
      const doctorId = doctor._id;
      await updateAttendance(doctorId, 2);
    }
    await Doctor.updateMany({ isAttend: false });
    console.log("Cron job executed successfully.");
  } catch (error) {
    console.error("Error executing cron job:", error);
  }
});

// Your existing routes and middleware
app.use(express.json());
app.use(cors());
app.use(logger("dev"));
const indexRoute = require('./route/index');  // Adjust the path as necessary
app.use(indexRoute);
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// Export the app as a serverless function
module.exports.handler = serverless(app);
