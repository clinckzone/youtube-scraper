type ChannelLoaderProps = {
  length: number;
  progress: number;
};

export const ChannelLoader: React.FC<ChannelLoaderProps> = ({
  length,
  progress,
}) => {
  return (
    <div className='channel-loader-container'>
      <div className='channel-loader' style={{ width: `${length}px` }}>
        <div
          className='channel-loader-progress'
          style={{
            width: `${length * 0.01 * progress}px`,
          }}
        ></div>
      </div>
      {`Progress: ${progress}%`}
    </div>
  );
};

export const SearchLoader: React.FC = () => {
  return (
    <div className='search-loader-container'>
      <div className='search-loader' />
      Loading
    </div>
  );
};
