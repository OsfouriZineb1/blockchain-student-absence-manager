const express = require("express")
const router=express.Router()
const controller=require("../controllers/controller")
const presenceController=require("../controllers/presenceController")
const examController = require("../controllers/examController")



router.route("/")
.get(controller.get)
.post(controller.post)

router.route("/presence")
.post(presenceController.post)
.get(presenceController.get)

router.route("/exams")
.post(examController.post)
.get(examController.get)
.delete(examController.delete)


module.exports=router