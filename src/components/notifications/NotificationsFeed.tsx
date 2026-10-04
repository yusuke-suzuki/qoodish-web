'use client';
import { Button, List } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition
} from 'react';
import type { Notification } from '../../../types/index.ts';
import { fetchMoreNotifications } from '../../actions/notifications.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import { notificationGroupKey } from '../../utils/notificationGroupKey.ts';
import NotificationList from './NotificationList.tsx';

type Props = {
  notifications: Notification[];
  nextCursor: string | null;
};

function uniqueGroups(notifications: Notification[]) {
  return notifications.filter(
    (notification, index) =>
      notifications.findIndex(
        (other) =>
          notificationGroupKey(other) === notificationGroupKey(notification)
      ) === index
  );
}

export default function NotificationsFeed({
  notifications,
  nextCursor
}: Props) {
  const router = useRouter();
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  const [firstPage, setFirstPage] = useState(notifications);
  const [moreNotifications, setMoreNotifications] = useState<Notification[]>(
    []
  );
  const [moreCursor, setMoreCursor] = useState<string | null>();
  const [isPending, startTransition] = useTransition();
  const loadMoreRef = useRef<HTMLButtonElement>(null);

  if (notifications !== firstPage) {
    setFirstPage(notifications);

    if (moreCursor !== undefined) {
      setMoreNotifications((prev) => uniqueGroups([...firstPage, ...prev]));
    }
  }

  const cursor = moreCursor === undefined ? nextCursor : moreCursor;
  const shown = uniqueGroups([...notifications, ...moreNotifications]);

  const handleReadNotifications = () => {
    router.refresh();
  };

  const loadMore = () => {
    if (!cursor || isPending) {
      return;
    }

    startTransition(async () => {
      try {
        const page = await fetchMoreNotifications(lang, cursor);
        setMoreNotifications((prev) => [...prev, ...page.notifications]);
        setMoreCursor(page.nextCursor);
      } catch {
        enqueueSnackbar(dictionary['load more failed'], { variant: 'error' });
      }
    });
  };

  const onLoadMoreVisible = useEffectEvent(loadMore);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !cursor || isPending) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        onLoadMoreVisible();
      }
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [cursor, isPending]);

  return (
    <List>
      <NotificationList
        notifications={shown}
        onReadNotifications={handleReadNotifications}
      />
      {cursor && (
        <Button
          ref={loadMoreRef}
          onClick={loadMore}
          color="secondary"
          loading={isPending}
          fullWidth
        >
          {dictionary['load more']}
        </Button>
      )}
    </List>
  );
}
