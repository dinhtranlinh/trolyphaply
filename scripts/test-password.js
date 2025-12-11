const bcrypt = require('bcryptjs');

const password = 'LamKhanh1823$$$';
const hash = '$2b$10$NuM35P0XOPzwIa8CYtfPxOjOBLQoqK3FGQRzi7DXAKHrAnsqUJPEy';

console.log('Testing password verification...');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('');

bcrypt.compare(password, hash).then(result => {
  console.log('✅ Password match:', result);
  
  if (!result) {
    console.log('');
    console.log('⚠️ Password does not match!');
    console.log('Generating new hash for:', password);
    
    bcrypt.hash(password, 10).then(newHash => {
      console.log('New hash:', newHash);
    });
  }
}).catch(err => {
  console.error('❌ Error:', err);
});
