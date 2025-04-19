import fetch from 'node-fetch';
import fs from 'fs/promises'; // Use promises-based fs methods
import crypto from 'crypto';

const key = '12345678901234567890123456789012'; // 32 bytes for AES-256
const algorithm = 'aes-256-cbc';

 // Function to decrypt a string
function decrypt(encryptedData, ivHex) {
    // Convert the IV from hex back to a Buffer.
    const iv = Buffer.from(ivHex, 'hex');
  
    // Create a decipher object using the algorithm, key, and IV.
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
    // Decrypt the encrypted data.
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  
    // Finalize the decryption.
    decrypted += decipher.final('utf8');
  
    // Return the decrypted text.
    return decrypted;
}

async function queryVersion(serverURL, versionNumber) {
  try {
    const response = await fetch(serverURL + '/versions/query/' + versionNumber, {
      method: 'GET',
      headers:
      { 
       'X-Password-Hash': "$2b$08$nASx7MvmEfZG0q13eFdyYe338LsXK4xISKp7Xk8cKt3ivnT5S4X02",     // Or use a more standard header like 'Authorization'
      }
    });
    // Check for valid response
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const iv = data['iv']
    if (!('data' in data) || !('iv' in data)) {
      throw new Error(`Invalid response format: ${JSON.stringify(data)}: No data field found`);
    }
    console.log("Successfully loaded version contents:\n" + decrypt(data['data'], iv));
    return decrypt(data['data'], iv);
  } catch (error) {
    console.error('Error fetching version:', error);
    throw error; // Rethrow error
  }
}

async function bootVersion(version, active_version_name) {
  try {
    await fs.rm(active_version_name, { force: true }); // Ensure file is removed
    await fs.writeFile(active_version_name, version);
    console.log(`Version successfully booted to ${active_version_name}`);
  } catch (error) {
    console.error('Error booting version:', error);
    throw error;
  }
}

async function main(serverURL = 'http://localhost:8000', versionNumber = "latest") {
  try {
    const version = await queryVersion(serverURL, versionNumber);
    await bootVersion(version, "app/active_version");
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();