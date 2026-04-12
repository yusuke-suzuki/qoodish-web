'use client';

import { KeyboardArrowLeft } from '@mui/icons-material';
import { Alert, AlertTitle, Button, Container, Grid } from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useDictionary from '../../hooks/useDictionary';

export default function NotFound() {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  return (
    <Container sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
          <Alert severity="warning">
            <AlertTitle>{dictionary['page not found']}</AlertTitle>
            {dictionary['page not found description']}
          </Alert>
          <Link href={`/${lang}/discover`} passHref>
            <Button color="primary" startIcon={<KeyboardArrowLeft />}>
              {dictionary['back to our site']}
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
}
