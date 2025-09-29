import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Button,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Stack,
  Tab,
  Typography
} from '@mui/material';
import {
  type SyntheticEvent,
  memo,
  startTransition,
  useCallback,
  useContext,
  useState
} from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import { useProfile } from '../../hooks/useProfile';
import ProfileAvatar from '../common/ProfileAvatar';
import EditProfileDialog from './EditProfileDialog';
import UserMaps from './UserMaps';
import UserReviews from './UserReviews';

type Props = {
  id: number | null;
};

function UserProfile({ id }: Props) {
  const { currentUser } = useContext(AuthContext);
  const { profile, mutate, isLoading } = useProfile(id);

  const [tabValue, setTabValue] = useState('1');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const dictionary = useDictionary();

  const handleTabChange = useCallback(
    (_event: SyntheticEvent<Element, Event>, newValue: string) => {
      startTransition(() => {
        setTabValue(newValue);
      });
    },
    []
  );

  return (
    <>
      <TabContext value={tabValue}>
        <Card elevation={0}>
          <CardContent>
            <Stack
              spacing={1}
              sx={{
                placeItems: 'center'
              }}
            >
              {!profile ? (
                <>
                  <Skeleton variant="circular" width={100} height={100} />

                  <Skeleton width="50%" height={40} />

                  <Skeleton width="100%" />
                  <Skeleton width="100%" />
                </>
              ) : (
                <>
                  <ProfileAvatar size={100} profile={profile} />

                  <Typography
                    variant="h5"
                    align="center"
                    gutterBottom
                    fontWeight={600}
                  >
                    {profile?.name}
                  </Typography>

                  <Typography variant="body1" align="center" gutterBottom>
                    {profile?.biography}
                  </Typography>

                  {currentUser?.uid === profile?.uid && (
                    <Button
                      variant="contained"
                      disableElevation
                      color="inherit"
                      onClick={() => setEditDialogOpen(true)}
                      disabled={isLoading || !profile || !currentUser}
                    >
                      {dictionary['edit profile']}
                    </Button>
                  )}
                </>
              )}

              <Stack
                direction="row"
                divider={<Divider orientation="vertical" flexItem />}
                spacing={2}
              >
                <Stack justifyContent="center">
                  <Typography variant="h6" fontWeight="bold" align="center">
                    {profile?.reviews_count ? profile.reviews_count : 0}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    align="center"
                  >
                    {dictionary.spots}
                  </Typography>
                </Stack>

                <Stack justifyContent="center">
                  <Typography variant="h6" fontWeight="bold" align="center">
                    {profile?.maps_count ? profile.maps_count : 0}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    align="center"
                  >
                    {dictionary.maps}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>

          <TabList onChange={handleTabChange} centered>
            <Tab label={dictionary.spots} value="1" />
            <Tab label={dictionary.maps} value="2" />
          </TabList>
        </Card>

        <TabPanel value="1" sx={{ px: 0 }}>
          <UserReviews id={id} />
        </TabPanel>
        <TabPanel value="2" sx={{ px: 0 }}>
          <UserMaps id={id} />
        </TabPanel>
      </TabContext>

      <EditProfileDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentProfile={profile}
        onSaved={mutate}
      />
    </>
  );
}

export default memo(UserProfile);
