import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(request, response) {
    const basicAuth = request.header('Authorization');
    const encodedCredentials = basicAuth.split(' ')[1];
    if (!encodedCredentials) {
      response.statusCode = 401;
      return response.send({ error: 'Unauthorized' });
    }

    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');
    if (!email || !password) {
      response.statusCode = 401;
      return response.send({ error: 'Unauthorized' });
    }

    const userCredentials = { email, password: sha1(password) };
    const user = await dbClient.users.findOne(userCredentials);

    if (!user) {
      response.statusCode = 401;
      return response.send({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;

    redisClient.set(key, user._id.toString(), 24 * 60 * 3600);
    response.statusCode = 200;
    return response.send({ token });
  }

  static async getDisconnect(request, response) {
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

    await redisClient.del(`auth_${xToken}`);
    response.statusCode = 204;
    return response.end();
  }
}

module.exports = AuthController;
