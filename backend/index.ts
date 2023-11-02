import cors from 'cors';
import express from 'express';
import { fork } from 'child_process';
import {
  CRAWLER_STATE,
  MAX_CHANNELS_PER_KEYWORD,
  MAX_SUBSCRIBERS,
  MIN_SUBSCRIBERS,
  PORT,
} from './utils';

type ProcessMessageType = {
  state: CRAWLER_STATE;
  data: any;
};

const app = express();
app.use(cors());

app.get('/search', (req, res) => {
  let keywords = req.query.keywords;
  if (typeof keywords === 'string') {
    keywords = keywords.split(', ');
  }

  const minSubs = Number(req.query.minSub ?? MIN_SUBSCRIBERS);
  const maxSubs = Number(req.query.maxSub ?? MAX_SUBSCRIBERS);
  const maxChannelsPerKeyword = Number(
    req.query.maxChannelsPerKeyword ?? MAX_CHANNELS_PER_KEYWORD
  );

  const scraper = fork(__dirname + '/crawler.js');

  // Listen for messages from the child process
  scraper.on('message', (data: ProcessMessageType) => {
    if (
      data.state === CRAWLER_STATE.SEARCH ||
      data.state === CRAWLER_STATE.CHANNEL
    ) {
      res.write(JSON.stringify(data));
    } else if (data.state === CRAWLER_STATE.COMPLETED) {
      res.end();
    }
  });

  scraper.on('error', (err) => {
    console.error('Scraper error:', err);
    res.status(500).end('Internal Server Error');
  });

  scraper.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Scraper process exited with code ${code}`);
      res.status(500).end('Internal Server Error');
    }
  });

  // Send the necessary parameters to the child process
  scraper.send({
    keywords,
    minSubs,
    maxSubs,
    maxChannelsPerKeyword,
  });

  // Handle client disconnection
  res.on('close', () => {
    scraper.kill(); // Kill the child process if the client disconnects
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
