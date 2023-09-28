// @ts-check
const { fork } = require('child_process');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3000;
const MAX_SUBSCRIBERS = 100000000;
const MIN_SUBSCRIBERS = 1000;
const MAX_CHANNELS_PER_KEYWORD = 100;

/**
 * @typedef {Object} ScraperMessage
 * @property {'SEARCH' | 'CHANNEL' | 'COMPLETED'} state
 * @property {any} [data]
 */
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

	const scraper = fork('./crawler.js');

	// Listen for messages from the child process
	scraper.on(
		'message',
		/**
		 * @param {ScraperMessage} data
		 */
		(data) => {
			if (data.state === 'SEARCH' || data.state === 'CHANNEL') {
				res.write(JSON.stringify(data));
			} else if (data.state === 'COMPLETED') {
				res.end();
			}
		}
	);

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
