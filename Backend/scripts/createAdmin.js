#!/usr/bin/env node
/*
  Secure Admin Creator
  --------------------
  Usage:
    1) Add the following to Backend/.env:
       ADMIN_USERNAME=NeoPhoenix
       ADMIN_EMAIL=admin@example.com
       ADMIN_PHONE=9876543210
       ADMIN_PASSWORD=yourStrongPassword

    2) Run:
       npm run create-admin

  The script will connect to the DB, and create or update a user with role: 'admin'. Passwords are hashed by the User model pre-save hook.
*/

import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../connect.js';
import { User } from '../Schema/userSchema.js';
import mongoose from 'mongoose';

async function run() {
  const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PHONE || !ADMIN_PASSWORD) {
    console.error('Missing env vars. Please set ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PHONE and ADMIN_PASSWORD in your .env file.');
    process.exit(1);
  }

  try {
    await connectDB();

    const existing = await User.findOne({ $or: [{ username: ADMIN_USERNAME.toLowerCase() }, { email: ADMIN_EMAIL.toLowerCase() }] });

    if (existing) {
      existing.username = ADMIN_USERNAME.toLowerCase();
      existing.email = ADMIN_EMAIL.toLowerCase();
      existing.phone = ADMIN_PHONE;
      // Assign plain password; model's pre-save hook will hash it
      existing.password = ADMIN_PASSWORD;
      existing.role = 'admin';
      await existing.save();
      console.log('✅ Existing user updated to admin.');
    } else {
      const newUser = new User({
        username: ADMIN_USERNAME.toLowerCase(),
        email: ADMIN_EMAIL.toLowerCase(),
        phone: ADMIN_PHONE,
        password: ADMIN_PASSWORD,
        role: 'admin'
      });
      await newUser.save();
      console.log('✅ Admin user created successfully.');
    }
  } catch (err) {
    console.error('Error creating/updating admin user:', err.message);
  } finally {
    // close connection and exit
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
