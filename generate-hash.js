const bcrypt = require('bcryptjs');

const password = 'LamKhanh1823$$$';
const hash = bcrypt.hashSync(password, 10);

console.log('\n=== ADMIN PASSWORD HASH ===\n');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('Verify:', bcrypt.compareSync(password, hash));
console.log('\n=== SQL COMMAND ===\n');
console.log(`UPDATE admin_users SET password = '${hash}' WHERE email = 'admin@trolyphaply.vn';`);
console.log('\n');
