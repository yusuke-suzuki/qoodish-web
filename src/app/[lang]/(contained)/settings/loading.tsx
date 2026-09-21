import {
  Box,
  Card,
  CardActions,
  CardContent,
  Skeleton,
  Stack
} from '@mui/material';
import type { ReactNode } from 'react';

const PUSH_SWITCH_KEYS = [
  'liked',
  'coauthor-invited',
  'comment',
  'published'
] as const;

const PROVIDER_KEYS = ['google', 'email-link'] as const;

function CardHeading({ detailLines }: { detailLines: number }) {
  return (
    <>
      <Skeleton variant="text" width="45%" sx={{ typography: 'h5' }} />

      {Array.from({ length: detailLines }).map((_, index) => (
        <Skeleton
          variant="text"
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          key={`skeleton-settings-detail-${index}`}
          width={index === detailLines - 1 ? '70%' : '100%'}
        />
      ))}
    </>
  );
}

function SwitchRow({ labelWidth }: { labelWidth: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.75 }}>
      <Skeleton variant="rounded" width={34} height={20} />
      <Skeleton variant="text" width={labelWidth} />
    </Box>
  );
}

function SettingsCard({
  content,
  action
}: {
  content: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardContent>{content}</CardContent>
      {action && <CardActions>{action}</CardActions>}
    </Card>
  );
}

export default function Loading() {
  return (
    <Stack spacing={3}>
      <SettingsCard
        content={
          <>
            <CardHeading detailLines={2} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width="55%" />
            </Box>
          </>
        }
        action={<Skeleton variant="rounded" width={140} height={31} />}
      />

      <SettingsCard
        content={
          <>
            <CardHeading detailLines={1} />

            <Box sx={{ mt: 2 }}>
              <Skeleton variant="text" width={96} sx={{ mb: 1 }} />
              <SwitchRow labelWidth="70%" />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Skeleton variant="text" width={72} sx={{ mb: 1 }} />
              {PUSH_SWITCH_KEYS.map((key) => (
                <SwitchRow
                  key={`skeleton-settings-push-${key}`}
                  labelWidth="60%"
                />
              ))}
            </Box>
          </>
        }
        action={<Skeleton variant="rounded" width={96} height={37} />}
      />

      <SettingsCard
        content={
          <>
            <CardHeading detailLines={2} />

            <Stack spacing={1} sx={{ mt: 2 }}>
              {PROVIDER_KEYS.map((key) => (
                <Box
                  key={`skeleton-settings-provider-${key}`}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}
                >
                  <Skeleton variant="circular" width={24} height={24} />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Skeleton variant="text" width="35%" />
                    <Skeleton
                      variant="text"
                      width="55%"
                      sx={{ typography: 'body2' }}
                    />
                  </Box>

                  <Skeleton variant="rounded" width={72} height={31} />
                </Box>
              ))}
            </Stack>
          </>
        }
      />

      <SettingsCard
        content={<CardHeading detailLines={2} />}
        action={<Skeleton variant="rounded" width={80} height={37} />}
      />
    </Stack>
  );
}
