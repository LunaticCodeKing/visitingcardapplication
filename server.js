const http = require("http")
const url = require("url")
const cors = require("cors");
const exp = require("express");
const bp = require("body-parser");
const passport = require("passport");
const morgan = require("morgan");
const { connect } = require("mongoose");
const { success, error } = require("consola");

// Initialize the application
const app = exp();

// DB connections
const { DB, PORT } = require("./config");

// Middlewares
app.get(http);
app.use(cors());
app.set('view engine','ejs');
app.use(bp.json());
app.use(exp.static(__dirname + './uploads/'));
app.use(passport.initialize());
app.use(morgan('dev'))

require("./middlewares/passport")(passport);

// User Router Middleware
app.use("/", require("./routes/users"));

const startApp = async () => {
  try {
    // Connection With DB
    await connect(DB, {
      useFindAndModify: true,
      useUnifiedTopology: true,
      useNewUrlParser: true
    });

    success({
      message: `Successfully connected with the Database \n`,
      badge: true
    });

    // Start Listenting for the server on PORT
    app.listen(PORT, () =>
      success({ message: `Server started on PORT ${PORT}`, badge: true })
    );
  } catch (err) {
    error({
      message: `Unable to connect with Database \n${err}`,
      badge: true
    });
    startApp();
  }
};

startApp();




