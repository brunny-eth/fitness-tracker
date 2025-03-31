const bcrypt = require('bcrypt');

// The stored hash for blulinski17@gmail.com from your database
const storedHash = '$2a$10$WwzbGryL.QL2PCIMCoMynObxqcWU4RTqulHmVF2VJAMBBmpf11sU.';

// Add all your potential passwords here
const possiblePasswords = [
  'password123',
  'myPassword',
  'jbv3tbr-jnk0XWA5mhj',
  '1234567',
  'BZC9hgq@guf.vbe2udh',
  '123'
];

async function checkPasswords() {
  console.log('Testing passwords against hash...');
  
  for (const password of possiblePasswords) {
    try {
      const isMatch = await bcrypt.compare(password, storedHash);
      if (isMatch) {
        console.log(`✅ MATCH FOUND: "${password}" is the correct password!`);
        return;
      } else {
        console.log(`❌ Not a match: "${password}"`);
      }
    } catch (error) {
      console.error(`Error checking password "${password}":`, error);
    }
  }
  
  console.log('❌ No matching password found in the list.');
}

checkPasswords();