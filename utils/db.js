import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect()
      .then(() => {
        this.db = this.client.db(DB_DATABASE);
        this.users = this.db.collection('users');
        this.files = this.db.collection('files');
      })
      .catch((err) => {
        this.db = false;
        console.log(err.message);
      });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    // return new Promise((resolve, reject) => {
    //   this.users.countDocuments((err, res) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(res);
    //     }
    //   });
    // });
    return this.users.countDocuments();
  }

  async nbFiles() {
  //   return new Promise((resolve, reject) => {
  //     this.files.countDocuments((err, res) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve(res);
  //       }
  //     });
  //   });
  // }
    return this.files.countDocuments();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
