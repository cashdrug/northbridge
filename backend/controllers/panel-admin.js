import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';
import { escape } from 'html-escaper';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <title>Users List</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    #logout-btn {
      background: #d9534f;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 20px;
    }
    #logout-btn:hover {
      background: #c9302c;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 8px;
      border: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>
  <button id="logout-btn">Logout</button>
  <h1>Registered Users</h1>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Country</th>
        <th>City</th>
        <th>Latitude</th>
        <th>Longitude</th>
        <th>IP</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>{{CONTENT}}</tbody>
  </table>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          try {
            const response = await fetch('/admin-logout', {
              credentials: 'include'
            });
            const result = await response.json();
            if (result.success) {
              window.location.href = '/admin-login';
            } else {
              alert('Logout failed.');
            }
          } catch (err) {
            console.error('Logout error:', err);
            alert('Network error during logout.');
          }
        });
      }
    });
  </script>
</body>
</html>
`;


export async function exportToHTML(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    // Get users with pagination
    const result = await pool.query(
      'SELECT * FROM users ORDER BY date_of_sign_in DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const rows = result.rows.map(user => `
      <tr>
        <td>${escape(user.name || 'N/A')}</td>
        <td>${escape(user.email || 'N/A')}</td>
        <td>${escape(user.role || 'N/A')}</td>
        <td>${escape(user.country || 'N/A')}</td>
        <td>${escape(user.city || 'N/A')}</td>
        <td>${escape(String(user.latitude || 'N/A'))}</td> <!-- Ensure numbers are strings -->
        <td>${escape(String(user.longitude || 'N/A'))}</td>
        <td>${escape(user.ip_address || 'N/A')}</td>
        <td>${user.date_of_sign_in ? new Date(user.date_of_sign_in).toLocaleString() : 'N/A'}</td>
      </tr>
    `).join('');

    const html = HTML_TEMPLATE.replace('{{CONTENT}}', rows);
    res.type('html').send(html);
  } catch (error) {
    console.error('Error generating user list:', error);
    res.status(500).send(
      `Error generating user list: ${process.env.NODE_ENV === 'development' ? error.message : ''}`
    );
  }
}