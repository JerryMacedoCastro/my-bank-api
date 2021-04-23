import express from 'express';
import {promises} from 'fs'
import accountsRouter from './controller/accounts';
import {filename, logger} from './global'

const app = express();

app.use(express.json());
app.use('/account', accountsRouter);

app.listen(3333, async () => {
  try {
    await promises.readFile(filename, 'utf8');
    logger.info('API has started');
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };
    promises
      .writeFile(filename, JSON.stringify(initialJson))
      .catch((err) => {
        logger.error(err);
      });
  }
});