const bcrypt = require('bcryptjs');
const { findWorkerAccountByEmail, createWorkerAccount } = require('../models/userModel');

exports.createWorker = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await findWorkerAccountByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with that email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const worker = await createWorkerAccount({ email: normalizedEmail, password_hash });

    return res.status(201).json({ success: true, data: worker });
  } catch (error) {
    console.error('createWorker error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create worker account' });
  }
};
