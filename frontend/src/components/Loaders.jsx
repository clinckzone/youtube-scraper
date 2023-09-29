/* eslint-disable react/prop-types */
export function ChannelLoader(props) {
	return (
		<div className="channel-loader-container">
			<div className="channel-loader" style={{ width: `${props.length}px` }}>
				<div
					className="channel-loader-progress"
					style={{
						width: `${props.length * 0.01 * props.progress}px`,
					}}
				></div>
			</div>
			{`Progress: ${props.progress}%`}
		</div>
	);
}

export function SearchLoader() {
	return (
		<div className="search-loader-container">
			<div className="search-loader" />
			Loading
		</div>
	);
}
