if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const roommates = require("./routes/roommate.js");
const bookings = require("./routes/booking.js");
const wishlist = require("./routes/wishlist.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");
const user = require("./routes/user.js");

// New Dashboard Routes
const userDashboard = require("./routes/userDashboard.js");
const hostDashboard = require("./routes/hostDashboard.js");
const adminDashboard = require("./routes/adminDashboard.js");
const tripDashboard = require("./routes/tripDashboard.js");



const databaseUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";
const localDB = "mongodb://127.0.0.1:27017/wanderlust";

async function connectDB() {
    try {
        console.log("🔄 Connecting to Database...");
        await mongoose.connect(databaseUrl, { 
            serverSelectionTimeoutMS: 5000 
        });
        console.log("✅ Successfully connected to Database");
    } catch (err) {
        if (databaseUrl !== localDB) {
            console.error("❌ ATLASDB Connection Failed. Falling back to Local MongoDB...");
            try {
                await mongoose.disconnect();
                await mongoose.connect(localDB);
                console.log("✅ Successfully connected to Local MongoDB");
            } catch (localErr) {
                console.error("❌ Critical: Both Atlas and Local DB failed.", localErr);
            }
        } else {
            console.error("❌ Local Database Connection Failed.", err);
        }
    }
}

connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
    mongoUrl: databaseUrl,
    crypto: {
        secret: process.env.SECRET || "mysupersecretcode",
    },
    touchAfter: 24 * 60 * 60,
});

store.on("error", (err) => {
    console.log("MONGO STORE ERROR", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET || "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(async (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    
    // Condition-based UI: Check if user is part of an active trip
    if (req.user) {
        const Trip = require("./models/trip");
        res.locals.activeTrip = await Trip.findOne({ "members.user": req.user._id });
    } else {
        res.locals.activeTrip = null;
    }
    
    next();
});

app.get("/demouser", async(req, res) => {
    let fakeUser = ({
        email: "fake@gmail.com",
        username: "fakeUser"
    });
    let registeredUser = await User.register(fakeUser, "123456");
    res.send(registeredUser);
   
});


app.get("/", (req, res) => {
    res.redirect("/listings");
});


app.use("/listings", listings);
app.use("/roommates", roommates);
app.use("/listings/:id/bookings", bookings);
app.use("/wishlist", wishlist);
app.use("/bookings", bookings);
app.use("/listings/:id/reviews", reviews);
app.use("/", user);

// Register Dashboard Routes
app.use("/dashboard/user", userDashboard);
app.use("/dashboard/host", hostDashboard);
app.use("/dashboard/admin", adminDashboard);
app.use("/dashboard/trip", tripDashboard);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
    // res.status(statusCode).send(message);
});

const port = process.env.PORT || 8080;
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Store IO on app for access in controllers
app.set("io", io);

io.on("connection", (socket) => {
    // When a user connects, join a room named after their User ID
    socket.on("join-room", (userId) => {
        socket.join(userId);
    });
});

server.listen(port, () => {
    console.log(`server is listening to port ${port}`);
});