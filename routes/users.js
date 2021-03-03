const router = require("express").Router();
const { Router } = require("express");
const jwt_decode = require("jwt-decode");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: '/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

const fileFilter = (req,file,cb) => {
   if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
      cb(null,true);
   }else{
    cb(null,false);
   } 
}

const upload = multer({
  storage:storage,
  limits:{
    fileSize:1024 * 1024 * 5
  },
  fileFilter:fileFilter
});


// Bring in the User Registration function
const {
  userAuth,
  userLogin,
  checkRole,
  userRegister,
  createCard
} = require("../utils/Auth");

const { Users } = require("../models/User");
 
 // Users Registeration Route
router.post("/register-user", async (req, res) => {
    await userRegister(req.body, "user", res);
});

// Admin Registration Route
router.post("/register-admin", async (req, res) => {
    await userRegister(req.body, "admin", res);
});

// Users Login Route
router.post("/login-user", async (req, res) => {
    await userLogin(req.body, "user", res);
});

// Admin Login Route
router.post("/login-admin", async (req, res) => {
    await userLogin(req.body, "admin", res);
});


// Profile Route
router.get("/dashboard", async (req, res,next) => {
  let token = req.headers.authorization;
  var decoded = jwt_decode(token);
  var userId  = decoded._id;
  console.log("token --> " + userId)
  Users.findById({_id: userId}).exec().then(data => {
          res.status(200).json(data);
          console.log("data => " + data);
      }).catch(err => {
        res.status(400).send("unable to retreive from database");
        console.log(err)
      })
}); 


router.patch("/create-vcard",async (req, res) => {
    await createCard(req,res);
});

router.patch("/profile-picture",upload.single('profilepicture'),async(req, res) => {

  let token   = req.headers.authorization;
  var decoded = jwt_decode(token);
  var userId  = decoded._id;
  Users.findById({_id:userId}).exec().then(data => {
       const propic = Users.updateOne({
          _id            : userId,
          profilepicture : req.file.path
       })
        .then(item => {
            res.status(200).json({
                  propic,
                  message : "item saved to database",
                  status : 200,
                  url : 'http://localhost/create-vcard/' + userId
            });
        })
        .catch(err => {
            res.status(400).send("unable to save to database"),
            console.log(err)
        });  
   });
});

router.get('/usersList', async (req, res) => {
  Users.find()
  .exec()
  .then(users => {
      const response = {
          count: users.length,
          users: users
          };
          res.status(200).json(response);
        }).catch(err => {
        console.log(err);
        res.status(500).json({
            success: false
        })
    })
});

router.patch("/update", async (req, res,next) => {
  let token = req.headers.authorization;
  var decoded = jwt_decode(token);
  var userId  = decoded._id;
  Users.update({_id: userId},{ $set: req.body }).exec().then(result => {
      res.status(200).json({
          message : "item updated in database",
          status : 200,
          url : 'http://localhost/update/' + userId
      });
    }).catch(err => {
      console.log(err);
      res.status(500).json({error:err})
    });
}); 


router.delete("/delete",(req, res,next) => {
  let token = req.headers.authorization;
  var decoded = jwt_decode(token);
  var userId  = decoded._id;
  Users.deleteOne({_id: userId}).exec().then(result => {
    res.status(200).json({
      message : `deleted in database`,
      url : 'http://localhost/delete/' + userId
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({ "message" : "error in delete"})
  })
}); 

// Users Protected Route
router.get(
  "/user-protected",
  userAuth,
  checkRole(["user"]),
  async (req, res) => {
    return res.json("Hello User");
  }
);

// Admin Protected Route
router.get(
  "/admin-protected",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    return res.json("Hello Admin");
  }
);

module.exports = router;
