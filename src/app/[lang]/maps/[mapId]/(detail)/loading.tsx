import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Skeleton
} from '@mui/material';
import { drawerBleeding } from '../../../../../components/maps/constants';

const summaryCardWidth = 360;

const reviewSkeletonKeys = ['a', 'b', 'c'];

const tabSkeletonKeys = ['spots', 'chapters'];

export default function Loading() {
  return (
    <Box sx={{ display: { xs: 'block', md: 'flex' } }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: summaryCardWidth,
          height: '100dvh'
        }}
      >
        <Card sx={{ height: '100%', width: '100%', overflowY: 'auto' }}>
          <Skeleton variant="rectangular" height={180} />
          <CardContent sx={{ pb: 0 }}>
            <Skeleton height={70} />
          </CardContent>
          <CardHeader
            avatar={<Skeleton variant="circular" width={40} height={40} />}
            title={<Skeleton height={20} width="50%" />}
            subheader={<Skeleton height={20} width="50%" />}
          />
          <CardContent sx={{ pt: 0, pb: 0 }}>
            <Skeleton />
            <Skeleton />
          </CardContent>
          <CardActions sx={{ p: 2 }}>
            <Skeleton variant="rounded" height={36} width="100%" />
          </CardActions>
          <Divider />
          <CardContent>
            <Skeleton variant="text" width="30%" sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
          </CardContent>
          <Divider />
          <Box
            sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}
          >
            {tabSkeletonKeys.map((key) => (
              <Box
                key={key}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  py: 1.5
                }}
              >
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width="40%" />
              </Box>
            ))}
          </Box>
          <Box sx={{ px: 2 }}>
            {reviewSkeletonKeys.map((key) => (
              <Box
                key={key}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}
              >
                <Skeleton variant="rounded" width={40} height={40} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" />
                </Box>
                <Skeleton variant="circular" width={24} height={24} />
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      <Skeleton
        variant="rectangular"
        sx={{
          height: {
            xs: `calc(100dvh - ${drawerBleeding}px - 56px)`,
            sm: `calc(100dvh - ${drawerBleeding}px - 64px)`,
            md: '100dvh'
          },
          width: {
            md: `calc(100dvw - ${summaryCardWidth}px)`
          },
          flexGrow: 1
        }}
      />

      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: drawerBleeding,
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.75 }}>
          <Skeleton variant="rounded" width={24} height={4} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            pb: 2
          }}
        >
          <Skeleton variant="rounded" width={64} height={64} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="70%" />
            <Skeleton
              variant="text"
              sx={{ fontSize: '0.875rem' }}
              width="40%"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
