import 'babel-polyfill';
import Koa from 'koa';
import logger from 'koa-logger';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import routes from './routes';
import dotenv from 'dotenv';
import error from 'koa-json-error';
import ApplicationError from './app/models/errors/ApplicationError';
import detectLocale from './app/middlewares/detectLocale';

const formatError = (error) => {
  console.log(error);
  let json;
  if (error instanceof ApplicationError) {
    json = {
      status: error.status,
      title: error.name,
      detail: error.message
    };
  } else {
    json = {
      status: 500,
      title: 'Error',
      detail: 'The application has encountered an unknown error.'
    };
  }
  console.log(json);
  return json;
}

const app = new Koa();

dotenv.config();

app.use(error(formatError));
app.use(json());
app.use(bodyParser());
app.use(logger());
app.use(serve(__dirname + '/public'));
app.use(detectLocale);

routes(app);

app.listen(process.env.PORT || 3000);
console.log('Starting...');
