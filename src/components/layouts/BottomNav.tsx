import {
  AccountCircle,
  AddBox,
  Explore,
  Home,
  Notifications
} from '@mui/icons-material';
import {
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { memo, useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import { useNotifications } from '../../hooks/useNotifications';
import { useProfile } from '../../hooks/useProfile';

type Props = {
  onCreateMapClick: () => void;
};

export default memo(function BottomNav({ onCreateMapClick }: Props) {
  const { currentUser } = useContext(AuthContext);

  const { profile } = useProfile(currentUser?.uid);
  const { notifications } = useNotifications();

  const unreadNotifications = notifications.filter((notification) => {
    return notification.read === false;
  });

  const [bottomNavValue, setBottomNavValue] = useState<number | undefined>(
    undefined
  );

  const dictionary = useDictionary();
  const router = useRouter();
  const { pathname } = router;

  useEffect(() => {
    switch (pathname) {
      case '/':
        setBottomNavValue(0);
        break;
      case '/discover':
        setBottomNavValue(1);
        break;
      case '/notifications':
        setBottomNavValue(3);
        break;
      case '/users/[userId]':
        setBottomNavValue(4);
        break;
      default:
        setBottomNavValue(0);
    }
  }, [pathname]);

  return (
    <Paper>
      <BottomNavigation value={bottomNavValue}>
        <BottomNavigationAction
          title={dictionary.home}
          icon={<Home />}
          LinkComponent={Link}
          href="/"
        />
        <BottomNavigationAction
          title={dictionary.discover}
          icon={<Explore />}
          LinkComponent={Link}
          href="/discover"
        />
        <BottomNavigationAction
          title={dictionary['create new map']}
          icon={<AddBox color="secondary" />}
          onClick={onCreateMapClick}
        />
        <BottomNavigationAction
          title={dictionary.notice}
          icon={
            <Badge badgeContent={unreadNotifications.length} color="secondary">
              <Notifications />
            </Badge>
          }
          LinkComponent={Link}
          href="/notifications"
        />
        <BottomNavigationAction
          title={dictionary.account}
          icon={<AccountCircle />}
          LinkComponent={Link}
          href={`/users/${profile?.id}`}
        />
      </BottomNavigation>
    </Paper>
  );
});
