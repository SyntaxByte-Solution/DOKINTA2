const express = require('express');
const route = express.Router();
const checkAccess = require('../../middleware/checkAccess');
const complainController = require('../../controller/admin/complain.controller.js')


route.get('/get', checkAccess(), complainController.pendingSolvedComplains);
route.get('/suggestions', checkAccess(), complainController.suggestions);
route.put('/solveComplain', checkAccess(), complainController.solveComplain);
route.delete('/delete', checkAccess(), complainController.deleteComplain);


module.exports = route;