const bcrypt = require('bcrypt');

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10).then((hash) => {
  console.log('Пароль:', password);
  console.log('Хеш:   ', hash);
});