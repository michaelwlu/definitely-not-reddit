import React from 'react';
import Announcement from 'react-announcement';

interface ContentAnnouncementProps {}

const ContentAnnouncement: React.FC<ContentAnnouncementProps> = ({}) => {
  return (
    <Announcement
      title="Introducing Content Posts"
      subtitle="You can now create posts with image, gif, video, and website links. Learn more here."
      link="/post/28"
      imageSource="minion.png"
      daysToLive={3}
    />
  );
};

export default ContentAnnouncement;
