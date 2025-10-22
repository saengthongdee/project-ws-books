const bcrypt = require('bcrypt');

async function generateHash() {
  const password = "Rang1114";
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
}

generateHash();