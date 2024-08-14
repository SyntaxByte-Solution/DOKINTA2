const express = require('express');
const route = express.Router()
const attendanceController = require('../../controller/admin/attendance.controller')
const checkAccess = require('../../middleware/checkAccess')

route.get('/', checkAccess(), attendanceController.getAttendance);

module.exports = route
