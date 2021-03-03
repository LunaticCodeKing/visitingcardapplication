const { Schema, model } = require("mongoose");
// const ObjectId = Schema.ObjectId;

const UserSchema = new Schema(
  {
    username    : {type: String,trim: true},
    email       : {type: String,trim:true},
    password    : {type: String,trim: true},
    mobile      : {trim: true,unique: [true, "Mobile Number already available"],type: String,
      validate(value) {
        if (value.length !== 10) {
           throw new Error("Mobile Number is invalid!");
        }
      }
    },
    role               : {type: String,default:"user", enum:["user", "admin"]},
    firstname          : {type: String,trim:true},
    lastname           : {type: String,trim:true},
    profession         : {type: String,trim:true},
    companyDetails  : {
        name        : {trim: true,type: String},
        email       : {trim: true,type: String},
        address     : {trim: true,type: String},
        tagline     : {trim: true,type: String},
        portfolio   : {trim: true,type: String}
    },
    skillSet : {
        skills             : {type: String,trim:true},
        achievements       : {type: String,trim:true},
        experience         : {type: String,trim:true},
        experiencedesc     : {type: String,trim:true},  
        education          : {type: String,trim:true}
    },
    socialLinks : {
        instagramURL  : {type: String,
          validate: {
              validator: function(text) {
                  return text.indexOf('https://instagram.com/') === 0;
              },
              message: 'instagram handle must start with https://instagram.com/'
          }
        },
        fbURL       : { type: String,
          validate: {
              validator: function(text) {
                  return text.indexOf('https://www.facebook.com/') === 0;
              },
              message: 'Facebook must start with https://www.facebook.com/'
            },
        },
        skypeidURL         : {type: String,
          validate: {
              validator: function(text) {
                  return text.indexOf('https://skype.com/') === 0;
              },
              message: 'skype handle must start with https://skype.com/'
          }
        },
        linkedinURl        : {type: String,
          validate: {
              validator: function(text) {
                  return text.indexOf('https://www.linkedin.com/') === 0;
              },
              message: 'LinkedIn must start with https://www.linkedin.com/'
          }
        },
        whatsappnumber     : {trim: true,type: String,
        validate(value) {
          if (value.length !== 10) {
            throw new Error("Mobile Number is invalid!");
          }
        }
      }
    },
    profilepicture     : {type: String,data:Buffer},
  }, 
  { 
    timestamps: true 
  }
);


const Users =  model("users", UserSchema);
module.exports = {Users};

