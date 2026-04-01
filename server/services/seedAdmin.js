require("dotenv").config({ path: __dirname + '/../.env' });
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const connectDB = require("../config/db");

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = "MARUTHAMSTORES";
        const existingAdmin = await Admin.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const newAdmin = new Admin({
            email: adminEmail,
            password: "marutham@2026", // Replace this with a secure password if needed
            name: "Main Admin",
            role: "superadmin"
        });

        await newAdmin.save();
        console.log("Admin user seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding admin:", err);
        process.exit(1);
    }
};

seedAdmin();
