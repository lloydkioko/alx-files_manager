import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;

    if (!email) {
      response.statusCode = 400;
      return response.send({ error: 'Missing email' });
    }

    if (!password) {
      response.statusCode = 400;
      return response.send({ error: 'Missing password' });
    }

    const user = await dbClient.users.findOne({ email });
    if (user) {
      response.statusCode = 400;
      return response.send({ error: 'Already exist' });
    }

    const newUser = await dbClient.users.insertOne({ email, password: sha1(password) });
    response.statusCode = 201;
    return response.send({ id: newUser.insertedId, email });
  }

  static async getMe(request, response) {
    const xToken = request.header('X-Token');
    if (!xToken) {
      response.statusCode = 401;
      return response.send({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${xToken}`);
    if (!userId) {
      response.statusCode = 401;
      return response.send({ error: 'Unauthorized' });
    }

    const user = await dbClient.users.findOne({ _id: ObjectId(userId) });
    if (!user) {
      response.statusCode = 401;
      return response.send({ error: 'Unauthorized' });
    }
    response.statusCode = 200;
    return response.send({ id: userId, email: user.email });
  }
}

module.exports = UsersController;
