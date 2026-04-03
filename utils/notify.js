const Notification = require("../models/notification.js");

/**
 * Send a real-time notification to a user and save it to the DB history.
 * @param {object} appExpress - The Express application instance (from req.app)
 * @param {string} userId - Recipient User ID
 * @param {string} message - Notification message content
 * @param {string} type - "Booking", "Roommate", "Message", etc.
 * @param {string} link - Optional URL for redirect
 */
module.exports = async (appExpress, userId, message, type = "Promotion", link = "#") => {
    try {
        // 1. Save to MongoDB for history
        const newNotif = new Notification({
            recipient: userId,
            message: message,
            type: type,
            link: link
        });
        await newNotif.save();

        // 2. Clear old notifications (Optional, keeps DB lean)
        // Keep last 20 notifications for the user
        // await Notification.deleteMany({ recipient: userId, createdAt: { $lt: Date.now() - 30 * 24 * 60 * 60 * 1000 } });

        // 3. Emit real-time event via Socket.io
        const io = appExpress.get("io");
        io.to(userId.toString()).emit("new-notif", {
            message,
            type,
            link,
            createdAt: new Date()
        });

    } catch (e) {
        console.error("Notification System Error: ", e);
    }
};
