import './App.css';
import { useCallback, useRef } from 'react';

function App() {
	const keywordsRef = useRef(null);
	const minSubRef = useRef(null);
	const maxSubRef = useRef(null);
	const maxChannelsPerKeywordRef = useRef(null);

	const startScraping = useCallback(async () => {
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
					console.log('All chunks have been received.');
					break;
				}
				const data = JSON.parse(new TextDecoder().decode(value));
				console.log(data);
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}, []);

	return (
		<>
			<h1>Youtube scraper</h1>
			<label htmlFor="keywords">Keywords: </label>
			<br />
			<input id="keywords" ref={keywordsRef} placeholder="coding, programming"></input>

			<br />
			<label htmlFor="minSub">Min. Subscribers</label>
			<br />
			<input id="minSub" ref={minSubRef} placeholder="1000"></input>

			<br />
			<label htmlFor="maxSub">Max. Subscribers</label>
			<br />
			<input id="maxSub" ref={maxSubRef} placeholder="1000"></input>

			<br />
			<label htmlFor="maxChannelsPerKeyword">Max. channels per keyword</label>
			<br />
			<input
				id="maxChannelsPerKeyword"
				ref={maxChannelsPerKeywordRef}
				placeholder="1000000"
			></input>

			<br />
			<button onClick={startScraping}>Scrape</button>
		</>
	);
}

export default App;
