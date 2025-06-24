import { Router } from 'express';
import pool from '../db.js';
import { body, validationResult } from 'express-validator';

const router = Router();

router.post(
  '/users',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .escape(),
    body('role')
      .trim()
      .notEmpty().withMessage('Role is required')
      .isIn(['Investor', 'investor', 'Entrepreneur', 'entrepreneur', 'Startup', 'startup']).withMessage('Invalid role'),
    body('email')
      .trim()
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail()
      .escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg)
      });
    }
   
    const { name, role, email, ipData } = req.body;
    const ip = ipData?.ip || null;
    const country = ipData?.country || null;
    const city = ipData?.city || null;
    const latitude = ipData?.latitude || null;
    const longitude = ipData?.longitude || null;
    const userAgent = ipData?.userAgent || null;

    const finalIP = ip || (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
                    req.socket.remoteAddress || 'N/A';
    const finalUserAgent = userAgent || req.headers['user-agent'] || 'N/A';
   
    try {
      const queryText = `
        INSERT INTO users (
          name, role, email, ip_address, user_agent,
          country, city, latitude, longitude, date_of_sign_in
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING *;
      `;
     
      const queryParams = [
        name, 
        role, 
        email, 
        finalIP, 
        finalUserAgent,
        country || 'N/A', 
        city || 'N/A', 
        latitude, 
        longitude, 
        new Date()
      ];
     
      const result = await pool.query(queryText, queryParams);
     
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: result.rows[0]
      });
     
    } catch (err) {
      console.error('Database error:', err);
     
      if (err.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Cannot be registered'
        });
      }
     
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

export default router;