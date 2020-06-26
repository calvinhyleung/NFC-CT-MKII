const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const ObjectId = require("mongodb").ObjectID;
const moment = require("moment");

const Logs = require("../models/Logs");

// @desc show add page
// @route GET /logs/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("logs/add");
});

// @desc show add form
// @route POST /logs
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Logs.create(req.body);
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.render("error/500");
  }
});

// @desc show show all logs
// @route GET /logs
router.get("/", ensureAuth, async (req, res) => {
  try {
    //******************************use this part to find overlaps

    const userLogs = await Logs.find({
      user: req.user.id,
    });

    const positiveLogs = await Logs.find({
      status: "positive",
    });
    //console.log(userLogs);
    //console.log(positiveLogs);
    //console.log(typeof userLogs[0].scannedAt);

    let overlapSet = new Set();

    for (let k = 0; k < positiveLogs.length; k++) {
      // search positiveLogs[k].scannedAt in between user scan and left
      overlapSet.add(
        await Logs.find({
          user: req.user.id,
          chipId: positiveLogs[k].chipId,
          scannedAt: { $lt: positiveLogs[k].scannedAt },
          leftAt: { $gte: positiveLogs[k].scannedAt },
        }).populate("user").lean()
      );
      // search positiveLogs[k].leftAt in between user scan and left
      overlapSet.add(
        await Logs.find({
          user: req.user.id,
          chipId: positiveLogs[k].chipId,
          scannedAt: { $lt: positiveLogs[k].leftAt },
          leftAt: { $gte: positiveLogs[k].leftAt },
        }).populate("user").lean()
      );
      // search user scan and left that is both between positiveLogs[k].scannedAt and positiveLogs[k].leftAt
      overlapSet.add(
        await Logs.find({
          user: req.user.id,
          chipId: positiveLogs[k].chipId,
          scannedAt: {
            $gte: positiveLogs[k].leftAt,
            $lt: positiveLogs[k].leftAt,
          },
          leftAt: { $gte: positiveLogs[k].leftAt, $lt: positiveLogs[k].leftAt },
        }).populate("user").lean()
      );
      //console.log(overlapLogs)
    }
    const overlapArray = Array.from(overlapSet);

    //console.log(overlapArray);
    let uniqueSet = new Set();
    for (let i = 0; i < overlapArray.length; i++) {
      for (let j = 0; j < overlapArray[i].length; j++) {
        uniqueSet.add(overlapArray[i][j]);
      }
    }
    //console.log(uniqueSet)
    const uniqueArray = Array.from(uniqueSet);
    //console.log( uniqueArray);
    //console.log( uniqueArray[0]._id);
    
    let displayArray = [];
    for(let m = 0; m < uniqueArray.length; m++){
        if(displayArray.length == 0){
            displayArray.push(uniqueArray[m]);
        }
        for(let n = 0; n < displayArray.length; n++){
            if (String(uniqueArray[m]._id) != String(displayArray[n]._id)){
                //console.log(typeof uniqueArray[m]._id)
                //console.log(typeof displayArray[n]._id)
                //console.log(uniqueArray[m]._id != displayArray[n]._id)
                displayArray.push(uniqueArray[m]);
                
            }
            
        }
    }
    //console.log(displayArray);
    
/*
    let uniqueMap = new Map();
    for (let i = 0; i < overlapArray.length; i++) {
      for (let j = 0; j < overlapArray[i].length; j++) {
        uniqueMap.set(overlapArray[i][j]._id,overlapArray[i][j]);
      }
    }
    let keys =[];
    for (let key of uniqueMap)
        keys.push(key);
    console.log(keys);
*/
    
    const logs = await Logs.find({
      status: "positive",
      //scannedAt: ,
      //leftAt: ,
    })
      .populate("user")
      .sort({ scannedAt: "desc" })
      .lean();
    //console.log(typeof logs)

    res.render("logs/index", {
        displayArray,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc show edit page
// @route GET /logs/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  const log = await Logs.findOne({
    _id: req.params.id,
  }).lean();

  if (!log) {
    return res.render("error/404");
  }
  if (log.user != req.user.id) {
    res.redirect("/logs");
  } else {
    res.render("logs/edit", {
      log,
    });
  }
});

// @desc update log
// @route GET /logs/:id
router.put("/:id", ensureAuth, async (req, res) => {
  let log = await Logs.findById(req.params.id).lean();
  const scannedAt = log.scannedAt;
  //console.log(req.body.hourInput)
  if (!log) {
    return res.render("error/404");
  }
  if (log.user != req.user.id) {
    res.redirect("/logs");
  } else {
    log = await Logs.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      //req.body,
      {
        leftAt: moment(scannedAt)
          .add(req.body.hourInput, "hours")
          .add(req.body.minuteInput, "minutes"),
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.redirect("/dashboard");
  }
});

module.exports = router;
