import express from 'express';
import fs from 'fs';
const app = express();
const PORT = 8000;
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = '12345678901234567890123456789012'; // Must be 32 bytes for AES-256

function encrypt(text) {
    // Generate a random initialization vector (IV).
    const iv = crypto.randomBytes(16);  // 16 bytes for AES-256-CBC
    console.log(iv.toString('hex'))
    // Create a cipher object using the algorithm, key, and IV.
    const cipher = crypto.createCipheriv(algorithm, key, iv);
  
    // Encrypt the text.  We can update the cipher multiple times if the input
    // is in multiple parts.  The 'utf8' encoding is for the input text.
    let encrypted = cipher.update(text, 'utf8', 'hex');
  
    // Finalize the encryption.  No more data can be added after this.
    encrypted += cipher.final('hex');
  
    // Return the IV and the encrypted text.  The IV is needed for decryption.
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted
    };
}

//password: 'snaldkja12!@sncjkxnjd@#$(nk1232jnlksdjfwij'

const password = "$2b$08$nASx7MvmEfZG0q13eFdyYe338LsXK4xISKp7Xk8cKt3ivnT5S4X02"

// Middleware
app.use(express.json()); // Parse JSON bodies

function getDirectoryItemCount(directoryPath) {
    try {
      const items = fs.readdirSync(directoryPath);
      return items.length;
    } catch (error) {
      console.error(`Error reading directory: ${error.message}`);
      return -1;
    }
  }

app.get('/versions/query/:id', async (req, res) => {
    let password = await bcrypt.hashSync(req.headers['x-password-hash'], 8)
    if (password != password) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    let id = req.params.id;
    if (id == 'latest') {
        id = getDirectoryItemCount('public');
    }
    const encrypted = encrypt(fs.readFileSync(`public/version${id}`, 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        return data;
    }))
    res.json({ data: encrypted['encryptedData'], iv: encrypted['iv'] });
})

app.get('/versions/latest', async (req, res) => {
    let password = await bcrypt.hashSync(req.headers['x-password-hash'], 8)
    if (password != password) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.json({ data: getDirectoryItemCount('public') })
})

app.listen(PORT, () => {
    console.log(`CI/CD Server is running on http://localhost:${PORT}`);
})