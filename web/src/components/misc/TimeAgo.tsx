import React from 'react';
import ReactTimeago from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import enShort from 'react-timeago/lib/language-strings/en-short';

interface TimeAgoProps {
  createdAt: string;
  updatedAt: string;
}

const TimeAgo: React.FC<TimeAgoProps> = ({ createdAt, updatedAt }) => {
  const shortFormatter = buildFormatter(enShort);
  return (
    <span>
      {' · '}
      <div className="hidden sm:inline">
        <ReactTimeago date={Number(createdAt)} minPeriod={30} />
      </div>
      <div className="inline sm:hidden">
        <ReactTimeago
          date={Number(createdAt)}
          minPeriod={30}
          formatter={shortFormatter}
        />
      </div>
      {createdAt !== updatedAt ? (
        <div className="inline">
          {' · edited '}
          <div className="hidden sm:inline">
            <ReactTimeago date={Number(updatedAt)} minPeriod={30} />
          </div>
          <div className="inline sm:hidden">
            <ReactTimeago
              date={Number(updatedAt)}
              minPeriod={30}
              formatter={shortFormatter}
            />
          </div>
        </div>
      ) : null}
    </span>
  );
};

export default TimeAgo;
