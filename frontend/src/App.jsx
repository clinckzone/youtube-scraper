import './css/App.css';
import InputScreen from './components/InputScreen';
import { useCallback, useRef, useState } from 'react';
import { ChannelLoader, SearchLoader } from './components/Loaders';

const STATE = {
	INPUT: 'INPUT', // Input is yet to be given
	SEARCH: 'SEARCH', // Channels that qualify the scraping criteria are being searched for
	CHANNEL: 'CHANNEL', // Channel data is being scraped
};

const LOADER_LENGTH = 300;

function App() {
	const [state, setState] = useState(STATE.INPUT);
	const [loadPercentage, setLoadPercentage] = useState(0);

	const keywordsRef = useRef(null);
	const minSubRef = useRef(null);
	const maxSubRef = useRef(null);
	const maxChannelsPerKeywordRef = useRef(null);

	const startScraping = useCallback(async () => {
		let totalChannelsToScrape = 0;
		let channelsScraped = 0;
		setState(STATE.SEARCH);

		const queryParams = {
			keywords: keywordsRef.current.value.split(','),
			minSub: minSubRef.current.value,
			maxSub: maxSubRef.current.value,
			maxChannelsPerKeyword: maxChannelsPerKeywordRef.current.value,
		};

		// Convert queryParams to a URLSearchParams object for easy query string formatting
		const queryString = new URLSearchParams(queryParams).toString();

		try {
			const response = await fetch(`http://localhost:3000/search?${queryString}`);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const reader = response.body.getReader();

			// eslint-disable-next-line no-constant-condition
			while (true) {
				const { value, done } = await reader.read();
				if (done) {
					setState(STATE.INPUT);
					console.log('All chunks have been received.');
					break;
				}

				const data = JSON.parse(new TextDecoder().decode(value));
				setState(data.state);

				if (data.state == STATE.SEARCH) totalChannelsToScrape += data.data.length;
				else if (data.state == STATE.CHANNEL) {
					channelsScraped++;
					const loadPercentage = (channelsScraped / totalChannelsToScrape) * 100;
					setLoadPercentage(loadPercentage);
				}

				console.log(data);
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}, []);

	const screenRenderer = {
		[STATE.INPUT]: (
			<InputScreen
				keywordsRef={keywordsRef}
				minSubRef={minSubRef}
				maxSubRef={maxSubRef}
				maxChannelsPerKeywordRef={maxChannelsPerKeywordRef}
				startScraping={startScraping}
			/>
		),
		[STATE.SEARCH]: <SearchLoader />,
		[STATE.CHANNEL]: <ChannelLoader length={LOADER_LENGTH} progress={loadPercentage} />,
	};

	return (
		<div className="container">
			<h1>Youtube scraper</h1>
			{screenRenderer[state]}
		</div>
	);
}

export default App;
