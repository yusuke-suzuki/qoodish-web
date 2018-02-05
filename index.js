import Koa from 'koa';
import logger from 'koa-logger';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import routes from './routes';
import dotenv from 'dotenv';
import detectLocale from './app/middlewares/detectLocale';

const app = new Koa();

dotenv.config();

app.use(json());
app.use(bodyParser());
app.use(logger());
app.use(serve(__dirname + '/public'));
app.use(detectLocale);

routes(app);

app.listen(process.env.PORT || 3000);
console.log('Starting...');
