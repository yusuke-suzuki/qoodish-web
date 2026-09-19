'use client';

import { KeyboardArrowLeft } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Pin } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import IssueDialog from '../common/IssueDialog.tsx';
import ProfileBoundary from '../common/ProfileBoundary.tsx';
import DeletePinDialog from './DeletePinDialog.tsx';
import EditPinDialog from './EditPinDialog.tsx';
import PinCardActions from './PinCardActions.tsx';
import PinCardHeader from './PinCardHeader.tsx';
import PinComments from './PinComments.tsx';
import PinImageList from './PinImageList.tsx';
import PinMenuButton from './PinMenuButton.tsx';

type Props = {
  pin: Pin;
};

export default function PinDetail({ pin }: Props) {
  const dictionary = useDictionary();

  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <PinCardHeader
          pin={pin}
          action={
            <ProfileBoundary>
              {(profile) => (
                <PinMenuButton
                  pin={pin}
                  currentProfile={profile}
                  onReportClick={() => setIssueDialogOpen(true)}
                  onEditClick={() => setEditDialogOpen(true)}
                  onDeleteClick={() => setDeleteDialogOpen(true)}
                  hideDetail
                />
              )}
            </ProfileBoundary>
          }
        />
        <CardContent sx={{ py: 0 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {pin.name}
          </Typography>

          <Typography component="p" gutterBottom>
            {pin.comment}
          </Typography>

          {pin.images.length > 0 && <PinImageList pin={pin} />}
        </CardContent>
        <PinCardActions pin={pin} onCommentAdded={router.refresh} />

        {pin.comments.length > 0 && (
          <CardContent>
            <PinComments comments={pin.comments} onDeleted={router.refresh} />
          </CardContent>
        )}
        <div />
      </Card>

      <Box sx={{ mt: 2 }}>
        <Button
          color="secondary"
          startIcon={<KeyboardArrowLeft />}
          LinkComponent={Link}
          href={`/${lang}/maps/${pin.map.id}`}
        >
          {dictionary['back to map']}
        </Button>
      </Box>

      <EditPinDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentPin={pin}
        onSaved={router.refresh}
      />

      <DeletePinDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        pin={pin}
        onDeleted={router.refresh}
      />

      <IssueDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        contentType="pin"
        contentId={pin.id}
      />
    </>
  );
}
