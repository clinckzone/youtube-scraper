import { useCallback } from 'react';
import './App.css';

function App() {
	const startScraping = useCallback(() => {}, []);

	return (
		<>
			<h1>Youtube scraper</h1>
			<label htmlFor="keywords">Keywords: </label>
			<br />
			<input id="keywords" placeholder="coding, programming"></input>

			<br />
			<label htmlFor="keywords">Min. Subscribers</label>
			<br />
			<input id="keywords" placeholder="1000"></input>

			<br />
			<label htmlFor="keywords">Max. Subscribers</label>
			<br />
			<input id="keywords" placeholder="1000"></input>

			<br />
			<label htmlFor="keywords">Max. channels per keyword</label>
			<br />
			<input id="keywords" placeholder="1000000"></input>

			<br />
			<button onClick={startScraping}>Scrape</button>
		</>
	);
}

export default App;
