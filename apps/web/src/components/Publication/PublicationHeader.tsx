import UserProfile from '@components/Shared/UserProfile';
import useModMode from '@components/utils/hooks/useModMode';
import { stopEventPropagation } from '@lib/stopEventPropagation';
import clsx from 'clsx';
import type { FeedItem, Publication } from 'lens';
import type { FC } from 'react';

import PublicationMenu from './Actions/Menu';
import Source from './Source';

interface PublicationHeaderProps {
  publication: Publication;
  className?: string;
  feedItem?: FeedItem;
}

const PublicationHeader: FC<PublicationHeaderProps> = ({ publication, className = '', feedItem }) => {
  const { allowed: modMode } = useModMode();
  const isMirror = publication.__typename === 'Mirror';
  const firstComment = feedItem?.comments && feedItem.comments[0];
  const rootPublication = feedItem ? (firstComment ? firstComment : feedItem?.root) : publication;
  const profile = feedItem
    ? rootPublication.profile
    : isMirror
    ? publication?.mirrorOf?.profile
    : publication?.profile;
  const timestamp = feedItem
    ? rootPublication.createdAt
    : isMirror
    ? publication?.mirrorOf?.createdAt
    : publication?.createdAt;

  return (
    <div
      className={clsx('flex justify-between space-x-1.5', className)}
      data-testid={`publication-${publication.id}-header`}
    >
      <div className="flex justify-start">
        <span onClick={stopEventPropagation}>
          <UserProfile profile={profile} timestamp={timestamp} showStatus />
        </span>
        {publication?.metadata.attributes.find((e) => e.traitType === 'zk3Circle') && (
          <label className="!bg-brand-500 text-brand border-brand-300 dark:border-brand-500 ml-4 mb-5 rounded-full border px-3 py-1.5 text-xs !text-white dark:bg-opacity-10 sm:px-4">
            {publication?.metadata.attributes.find((e) => e.traitType === 'zk3Circle')?.value?.toString()}
          </label>
        )}
      </div>
      <div className="!-mr-[7px] flex items-center space-x-1">
        {modMode && <Source publication={publication} />}
        <PublicationMenu publication={publication} />
      </div>
    </div>
  );
};

export default PublicationHeader;
