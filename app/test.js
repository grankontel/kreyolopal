const db = require('./services/db')
const User = require('./models/user')

async function testDb() {
try {
    // await db.authenticate();
    const tmalo=User.create({
        firstname: 'Thierry',
        lastname:'Malo',
        email: 'thierry.malo@gmail.com',
        password: 'test'
    })
    console.log(tmalo instanceof User);
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}


testDb()