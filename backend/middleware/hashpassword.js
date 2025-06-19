import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function hashPassword() {
  const saltRounds = 12;

  try {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, saltRounds);
    console.log('Hashed password:', hash);
    console.log('Update your .env ADMIN_PASSWORD with this value');
  } catch (err) {
    console.error('Ошибка при хэшировании:', err);
  }
} 

hashPassword();