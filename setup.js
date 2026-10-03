const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const { Client } = require('pg');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(resolve => rl.question(q, resolve));

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('\n=== University Service Portal - PostgreSQL Setup ===\n');

  const host = (await ask('PostgreSQL host [localhost]: ')).trim() || 'localhost';
  const port = (await ask('PostgreSQL port [5432]: ')).trim() || '5432';
  const user = (await ask('PostgreSQL username [postgres]: ')).trim() || 'postgres';
  const password = await ask('PostgreSQL password: ');
  const dbName = (await ask('Database name [university_portal]: ')).trim() || 'university_portal';

  const admin = new Client({ host, port: Number(port), user, password, database: 'postgres' });

  try {
    await admin.connect();
    console.log('\n✓ PostgreSQL login successful.');

    const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (!exists.rowCount) {
      const safeDb = '"' + dbName.replace(/"/g, '""') + '"';
      await admin.query(`CREATE DATABASE ${safeDb}`);
      console.log(`✓ Database "${dbName}" created.`);
    } else {
      console.log(`✓ Database "${dbName}" already exists.`);
    }
    await admin.end();

    const db = new Client({ host, port: Number(port), user, password, database: dbName });
    await db.connect();

    const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    await db.query(schema);

    const services = [
      ['Course Add/Drop', 'Request to add or drop a course.'],
      ['Leave Request', 'Request an academic leave.'],
      ['Student Certificate', 'Request an official student certificate.'],
      ['General Support', 'General university service request.']
    ];
    for (const [name, description] of services) {
await db.query(
  `INSERT INTO service_types(name, description)
   SELECT $1::text, $2::text
   WHERE NOT EXISTS (
     SELECT 1
     FROM service_types
     WHERE name = $1::text
   )`,
  [name, description]
);
    }

    const studentHash = hashPassword('password123');
    const staffHash = hashPassword('password123');

    await db.query(
      `INSERT INTO users(full_name,student_number,email,password_hash,role)
       VALUES($1,$2,$3,$4,'student')
       ON CONFLICT(email) DO NOTHING`,
      ['Demo Student', 'STU1001', 'student@demo.com', studentHash]
    );

    await db.query(
      `INSERT INTO users(full_name,student_number,email,password_hash,role)
       VALUES($1,NULL,$2,$3,'staff')
       ON CONFLICT(email) DO NOTHING`,
      ['Demo Staff', 'staff@demo.com', staffHash]
    );

    await db.end();

    const env = `PORT=3000
DB_HOST=${host}
DB_PORT=${port}
DB_NAME=${dbName}
DB_USER=${user}
DB_PASSWORD=${password.replace(/\r?\n/g, '')}
JWT_SECRET=${crypto.randomBytes(32).toString('hex')}
`;
    fs.writeFileSync(path.join(__dirname, '.env'), env, { encoding: 'utf8' });

    console.log('\n✓ Tables created.');
    console.log('✓ Demo accounts created.');
    console.log('✓ .env created.');
    console.log('\nStudent: student@demo.com / password123');
    console.log('Staff:   staff@demo.com / password123');
    console.log('\nSetup complete. Now run: npm start\n');
  } catch (err) {
    console.error('\n✗ Setup failed.');
    console.error(err.message);
    console.error('\nIf you see "password authentication failed", re-run npm run setup and enter the correct PostgreSQL password.');
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}
main();
