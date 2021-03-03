const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { Users } = require("../models/User");
const { SECRET } = require("../config");
const jwt_decode = require("jwt-decode");



/**
 * @DESC To register the user (ADMIN, USER)
 */
const userRegister = async (userDets, role, res) => {
  
  const username = userDets.username;
  const email    = userDets.email;
  const Password = userDets.password;
  const mobile   = userDets.mobile;


  try {
    // Validate the username
    let usernameNotTaken = await validateUsername(username);
  
    if (!usernameNotTaken) {
      return res.status(400).json({
        message: `Username is already taken.`,
        success: false
      });
    }

    // validate the email
    let emailNotRegistered = await validateEmail(email);
    if (!emailNotRegistered) {
      return res.status(400).json({
          message: `Email is already registered.`,
          success: false
      });
    }

    // Get the hashed password
    const passwordhash = await bcrypt.hash(Password, 12);

    //creating the token
    let token = jwt.sign(
      {
        role: role,
        username: username,
        email: email
      },
      SECRET,
      { expiresIn: "7 days" }
    );

    let data = {};
    data.email     = email;
    data.password  = passwordhash;
    data.username  = username;
    data.mobile    = mobile;
    data.token     = token;
    data.role      = role;
    data.firstname = null;
    data.lastname  = null;
    
    const resp = await Users.create(data);
    
      if(resp){
          var result = {
             user : resp,
             token,
          }
          return res.status(201).json({
            result,
            message: "Hurry! now you are successfully registred. Please nor login.",
            success: true
          });
      }
  }
   catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Unable to create your account.",
      success: false
    });
  }
};

/**
 * @DESC To Login the user (ADMIN, SUPER_ADMIN, USER)
 */

const userLogin = async (userCreds, role, res) => {
  
  let { username, password } = userCreds;

  // First Check if the username is in the database  
  let user = await Users.findOne({ username });

  if (!user) {
    return res.status(404).json({
      message: "Username is not found. Invalid login credentials.",
      success: false
    });
  }
  // We will check the role
  if (user.role !== role) {
    return res.status(403).json({
      message: "Please make sure you are logging in from the right portal.",
      success: false
    });
  }
  // That means user is existing and trying to signin fro the right portal
  // Now check for the password
  let isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
      //creating the token
      let token = jwt.sign(
        {
          _id : user._id,
          role: user.role,
          email: user.email
        },
        SECRET,
        { expiresIn: "7 days" }
      );

      const result = {
          user,
          token
      }  
      // Sign in the token and issue it to the user
      return res.status(200).json({
        result,
        message: "Hurray! You are now logged in.",
        success: true
      });
    } else {
      return res.status(403).json({
        message: "Incorrect password.",
        success: false
      });
    }
};

const createCard = async (req, res) => {
  try 
  {
        let token = req.headers.authorization;
        var decoded = jwt_decode(token)
        var userId  = decoded._id;
        console.log("userID" + userId);

        let userdata = {}

        userdata.firstname        = req.body.firstname
        userdata.lastname         = req.body.lastname,
        userdata.profession       = req.body.profession,
        userdata.companyDetails   = req.body.companyDetails,
        userdata.skillSet         = req.body.skillSet,
        userdata.socialLinks      = req.body.socialLinks 

        console.log(userdata);

        let result = await Users.updateOne({_id: userId},userdata,{new:true})
        console.log(result)
        if(result){
           return res.status(200).json({
            result,
            message: "saved",
            success: true
          })
         }
         return res.status(400).json({
          result,
          message: "data not saved",
          success: true
        })     
    }
      catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Authorization Error",
            success: false
      });
    }
};

const validateUsername = async username => {
  let user = await Users.findOne({ username : username });
  return user ? false : true;
};

/**
 * @DESC Passport middleware
 */
const userAuth = passport.authenticate("jwt", { session: false });

/**
 * @DESC Check Role Middleware
 */
const checkRole = roles => (req, res, next) =>
  !roles.includes(req.user.role)
    ? res.status(401).json("Unauthorized")
    : next();

const validateEmail = async email => {
  let user = await Users.findOne({ email:email });
  return user ? false : true;
};

module.exports = {
  userAuth,
  checkRole,
  userLogin,
  userRegister,
  createCard
};
