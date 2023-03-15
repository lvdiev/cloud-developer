import { APIGatewayProxyResult } from 'aws-lambda';
import { createLogger } from '../utils/logger';
import { CustomEvent } from './CustomEvent';
import { getUserId } from './utils';

const logger = createLogger('lambda_middlewares');

export const credentialsParser = () => ({
  before: (handler, next) => {
    const event = handler.event as CustomEvent;
    const token = event.headers.Authorization;

    if (!token) {
      const errorResponse: APIGatewayProxyResult = {
        statusCode: 401,
        body: JSON.stringify({ error: 'No token found.' })
      };
      return next(errorResponse);
    }

    try {

      event.userId = getUserId(event);

    } catch (error) {
      logger.error(error);

      const errorResponse: APIGatewayProxyResult = {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid token.' })
      };

      return next(errorResponse);
    }

    return next();
  }
});