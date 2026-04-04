const Trip = require("../models/trip");
const Message = require("../models/message");
const User = require("../models/user");

module.exports.index = async (req, res) => {
    const trip = await Trip.findById(req.params.id).populate('members.user');
    if (!trip) {
        req.flash('error', 'Trip not found');
        return res.redirect('/dashboard/user');
    }
    
    // Stats for overview
    const totalExpenses = trip.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const packingProgress = trip.packingList.length > 0 ? (trip.packingList.filter(i => i.isPacked).length / trip.packingList.length * 100).toFixed(0) : 0;
    
    res.render("dashboards/trip/index", { 
        tripId: req.params.id, dashboardType: "trip", activePath: "overview", 
        pageTitle: "Trip Overview", trip, totalExpenses, packingProgress
    });
};

module.exports.members = async (req, res) => {
    const trip = await Trip.findById(req.params.id).populate('members.user');
    res.render("dashboards/trip/members", { 
        tripId: req.params.id, dashboardType: "trip", activePath: "members", pageTitle: "Trip Members", 
        trip 
    });
};

module.exports.updateMemberInfo = async (req, res) => {
    const { id } = req.params;
    const { arrivalTime, contactInfo } = req.body;
    
    await Trip.findOneAndUpdate(
        { _id: id, "members.user": req.user._id },
        { 
            $set: { 
                "members.$.arrivalTime": arrivalTime, 
                "members.$.contactInfo": contactInfo,
                "members.$.status": "joined"
            } 
        }
    );
    
    req.flash("success", "Arrival info updated!");
    res.redirect(`/dashboard/trip/${id}/members`);
};

module.exports.planner = async (req, res) => {
    const trip = await Trip.findById(req.params.id);
    res.render("dashboards/trip/planner", { 
        tripId: req.params.id, dashboardType: "trip", activePath: "planner", pageTitle: "Trip Planner", 
        trip 
    });
};

module.exports.addPlan = async (req, res) => {
    const { id } = req.params;
    const { day, place, notes } = req.body;
    
    await Trip.findByIdAndUpdate(id, {
        $push: { planner: { day, places: [{ name: place, notes }] } }
    });
    
    req.flash("success", "New plan added to itinerary!");
    res.redirect(`/dashboard/trip/${id}/planner`);
};

module.exports.chat = async (req, res) => {
    const trip = await Trip.findById(req.params.id).populate('members.user');
    const messages = await Message.find({ tripId: req.params.id }).populate('sender').sort({ createdAt: 1 });
    
    res.render("dashboards/trip/chat", { 
        tripId: req.params.id, dashboardType: "trip", activePath: "chat", pageTitle: "Group Chat", 
        trip, messages 
    });
};

module.exports.expenses = async (req, res) => {
    const trip = await Trip.findById(req.params.id).populate('members.user expenses.paidBy');
    
    // Simple Expense Split Calculation (who owes what)
    // 1. Calculate each person's net balance
    let balances = {}; // {userId: amount}
    trip.members.forEach(m => balances[m.user._id.toString()] = 0);
    
    trip.expenses.forEach(exp => {
        const share = exp.amount / (exp.splitAmong && exp.splitAmong.length > 0 ? exp.splitAmong.length : trip.members.length);
        balances[exp.paidBy._id.toString()] += exp.amount;
        
        const splitters = exp.splitAmong && exp.splitAmong.length > 0 ? exp.splitAmong : trip.members.map(m => m.user._id);
        splitters.forEach(uid => {
            balances[uid.toString()] -= share;
        });
    });

    res.render("dashboards/trip/expenses", { 
        tripId: req.params.id, dashboardType: "trip", activePath: "expenses", pageTitle: "Split Expenses", 
        trip, balances
    });
};

module.exports.addExpense = async (req, res) => {
    const { id } = req.params;
    const { description, amount, category } = req.body;
    
    await Trip.findByIdAndUpdate(id, {
        $push: { expenses: { description, amount, category, paidBy: req.user._id, splitAmong: [] } }
    });
    
    req.flash("success", "Expense added to shared pool!");
    res.redirect(`/dashboard/trip/${id}/expenses`);
};

module.exports.packing = async (req, res) => {
    const trip = await Trip.findById(req.params.id).populate('members.user packingList.assignedTo');
    res.render("dashboards/trip/packing", { 
        tripId: req.params.id, dashboardType: "trip", activePath: "packing", pageTitle: "Packing List", 
        trip 
    });
};

module.exports.togglePackingItem = async (req, res) => {
    const { id, itemId } = req.params;
    const trip = await Trip.findById(id);
    const item = trip.packingList.id(itemId);
    item.isPacked = !item.isPacked;
    await trip.save();
    res.redirect(`/dashboard/trip/${id}/packing`);
};

module.exports.grocery = async (req, res) => {
    const trip = await Trip.findById(req.params.id).populate('members.user groceryList.assignedTo');
    res.render("dashboards/trip/grocery", { 
        tripId: req.params.id, dashboardType: "trip", activePath: "grocery", pageTitle: "Grocery Planner", 
        trip 
    });
};

module.exports.addGroceryItem = async (req, res) => {
    const { id } = req.params;
    const { item, assignedTo } = req.body;
    
    await Trip.findByIdAndUpdate(id, {
        $push: { groceryList: { item, assignedTo } }
    });
    
    req.flash("success", "Grocery item assigned!");
    res.redirect(`/dashboard/trip/${id}/grocery`);
};

module.exports.toggleRules = async (req, res) => {
    const { id } = req.params;
    await Trip.findByIdAndUpdate(id, {
        $addToSet: { "roomRules.agreedBy": req.user._id }
    });
    req.flash("success", "You have agreed to the room rules!");
    res.redirect(`/dashboard/trip/${id}`);
};
