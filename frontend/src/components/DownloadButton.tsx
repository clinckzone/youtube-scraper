type DownloadButtonProps = {
  data: any;
  fileName: string;
  downloadData: (data: any, fileName: string) => void;
};

const DownloadButton: React.FC<DownloadButtonProps> = ({
  data,
  fileName,
  downloadData,
}) => {
  return (
    <div>
      <button onClick={() => downloadData(data, fileName)}>
        Download JSON
      </button>
    </div>
  );
};

export default DownloadButton;
