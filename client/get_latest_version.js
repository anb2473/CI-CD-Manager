import fetch from 'node-fetch';
import crypto from 'crypto';

 // Function to decrypt a string
function decrypt(ivHex, encryptedData) {
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

async function getLatestVersion(serverURL = 'http://localhost:8000') {
    const response = await fetch(serverURL + '/versions/latest', {
          method: 'GET',
          headers:
           { 
            'X-Password-Hash': "snaldkja12!@sncjkxnjd@#$(nk1232jnlksdjfwij",     // Or use a more standard header like 'Authorization'
          },
    });

    if (response.status == 401) {
        throw new Error('Unauthorized: Invalid password hash');
    }

    const data = await response.json();

    if (!('data' in data)) {
        throw new Error(`Invalid response format: ${JSON.stringify(data)}: No data field found`);
    }

    console.log(data['data'])

    return parseInt(data['data'])
}

await getLatestVersion()