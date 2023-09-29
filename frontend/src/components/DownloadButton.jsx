/* eslint-disable react/prop-types */
function DownloadButton(props) {
	return (
		<div>
			<button onClick={() => props.downloadData(props.data, props.fileName)}>
				Download JSON
			</button>
		</div>
	);
}

export default DownloadButton;
