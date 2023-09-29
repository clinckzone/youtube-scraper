/* eslint-disable react/prop-types */
function InputScreen(props) {
	return (
		<div>
			<label htmlFor="keywords">Keywords: </label>
			<br />
			<input id="keywords" ref={props.keywordsRef} placeholder="coding, programming"></input>
			<br />
			<label htmlFor="minSub">Min. Subscribers</label>
			<br />
			<input id="minSub" ref={props.minSubRef} placeholder="1000"></input>
			<br />
			<label htmlFor="maxSub">Max. Subscribers</label>
			<br />
			<input id="maxSub" ref={props.maxSubRef} placeholder="1000"></input>
			<br />
			<label htmlFor="maxChannelsPerKeyword">Max. channels per keyword</label>
			<br />
			<input
				id="maxChannelsPerKeyword"
				ref={props.maxChannelsPerKeywordRef}
				placeholder="1000000"
			></input>
			<br />
			<button onClick={props.startScraping}>Scrape</button>
		</div>
	);
}

export default InputScreen;
