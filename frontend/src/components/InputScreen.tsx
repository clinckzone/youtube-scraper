import { MutableRefObject, RefObject } from 'react';

type InputScreenProps = {
  keywordsRef: RefObject<HTMLInputElement>;
  minSubRef: RefObject<HTMLInputElement>;
  maxSubRef: RefObject<HTMLInputElement>;
  maxChannelsPerKeywordRef: RefObject<HTMLInputElement>;
  startScraping: () => void;
};

const InputScreen: React.FC<InputScreenProps> = ({
  keywordsRef,
  minSubRef,
  maxSubRef,
  maxChannelsPerKeywordRef,
  startScraping,
}) => {
  return (
    <div>
      <label htmlFor='keywords'>Keywords: </label>
      <br />
      <input
        id='keywords'
        ref={keywordsRef}
        placeholder='coding, programming'
      ></input>
      <br />
      <label htmlFor='minSub'>Min. Subscribers</label>
      <br />
      <input id='minSub' ref={minSubRef} placeholder='1000'></input>
      <br />
      <label htmlFor='maxSub'>Max. Subscribers</label>
      <br />
      <input id='maxSub' ref={maxSubRef} placeholder='1000'></input>
      <br />
      <label htmlFor='maxChannelsPerKeyword'>Max. channels per keyword</label>
      <br />
      <input
        id='maxChannelsPerKeyword'
        ref={maxChannelsPerKeywordRef}
        placeholder='1000000'
      ></input>
      <br />
      <button onClick={startScraping}>Scrape</button>
    </div>
  );
};

export default InputScreen;
