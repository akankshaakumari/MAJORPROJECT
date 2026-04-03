const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const allBookings = await Booking.find({ user: req.user._id }).populate("listing");
    res.render("bookings/index.ejs", { allBookings });
};

module.exports.createBooking = async (req, res) => {
    try {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        
        let { checkIn, checkOut, guests } = req.body.booking;
        const dateIn = new Date(checkIn);
        const dateOut = new Date(checkOut);

        // 1. Basic validation
        if (dateIn >= dateOut) {
            req.flash("error", "Check-out date must be after Check-in date!");
            return res.redirect(`/listings/${id}`);
        }

        // 2. Availability Check: Find overlapping bookings for this listing
        const overlappingBookings = await Booking.find({
            listing: id,
            $or: [
                { checkIn: { $lt: dateOut }, checkOut: { $gt: dateIn } }
            ]
        });

        if (overlappingBookings.length > 0) {
            req.flash("error", "Sorry, these dates are already booked by someone else!");
            return res.redirect(`/listings/${id}`);
        }

        // 3. Price Calculation
        const diffInTime = dateOut.getTime() - dateIn.getTime();
        const nights = Math.ceil(diffInTime / (1000 * 3600 * 24));
        const totalPrice = nights * listing.price;

        const newBooking = new Booking({
            listing: id,
            user: req.user._id,
            checkIn: dateIn,
            checkOut: dateOut,
            guests: guests,
            totalPrice: totalPrice
        });

        await newBooking.save();
        req.flash("success", `Booking successful! Total: ₹${totalPrice.toLocaleString("en-IN")}`);
        res.redirect("/bookings");
        
    } catch(e) {
        req.flash("error", "Failed to create booking: " + e.message);
        res.redirect(`/listings/${req.params.id}`);
    }
};

module.exports.destroyBooking = async (req, res) => {
    let { id } = req.params;
    await Booking.findByIdAndDelete(id);
    req.flash("success", "Booking Cancelled Successfuly!");
    res.redirect("/bookings");
};
