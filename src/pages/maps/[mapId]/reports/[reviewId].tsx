import { KeyboardArrowLeft } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography
} from '@mui/material';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type ReactElement, useContext, useState } from 'react';
import type { Review } from '../../../../../types';
import Layout from '../../../../components/Layout';
import IssueDialog from '../../../../components/common/IssueDialog';
import DeleteReviewDialog from '../../../../components/reviews/DeleteReviewDialog';
import EditReviewDialog from '../../../../components/reviews/EditReviewDialog';
import ReviewCardActions from '../../../../components/reviews/ReviewCardActions';
import ReviewCardHeader from '../../../../components/reviews/ReviewCardHeader';
import ReviewComments from '../../../../components/reviews/ReviewComments';
import ReviewImageList from '../../../../components/reviews/ReviewImageList';
import ReviewMenuButton from '../../../../components/reviews/ReviewMenuButton';
import AuthContext from '../../../../context/AuthContext';
import useDictionary from '../../../../hooks/useDictionary';
import { useProfile } from '../../../../hooks/useProfile';
import { useReview } from '../../../../hooks/useReview';
import Custom404 from '../../../404';
import type { NextPageWithLayout } from '../../../_app';

type Props = {
  review: Review;
};

const ReviewPage: NextPageWithLayout = ({ review: serverReview }: Props) => {
  const dictionary = useDictionary();

  const router = useRouter();
  const { mapId, reviewId } = router.query;

  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);

  const {
    review: clientReview,
    isLoading,
    mutate
  } = useReview(Number(mapId), Number(reviewId));

  const review = clientReview || serverReview;

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const title = review
    ? `${review.name} - ${review.map.name} | Qoodish`
    : 'Qoodish';
  const description = review ? review.comment : dictionary['meta description'];
  const keywords = `${
    review ? `${review.map.name}, ${review.name}, ` : ''
  }Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`;
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;
  const defaultThumbnailUrl =
    router.locale === router.defaultLocale
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;
  const thumbnailUrl =
    review && review.images.length > 0
      ? review.images[0].thumbnail_url_800
      : defaultThumbnailUrl;

  if (!review && !isLoading) {
    return <Custom404 />;
  }

  return (
    <>
      <Head>
        <title>{title}</title>

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/maps/${mapId}/reports/${reviewId}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/maps/${mapId}/reports/${reviewId}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/ja/maps/${mapId}/reports/${reviewId}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/maps/${mapId}/reports/${reviewId}`}
          hrefLang="x-default"
        />

        {!review ||
          (review.map.private && <meta name="robots" content="noindex" />)}

        <meta name="keywords" content={keywords} />
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/maps/${mapId}/reports/${reviewId}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={dictionary['meta headline']} />
      </Head>

      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            my: 2
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card elevation={0}>
            <ReviewCardHeader
              review={review}
              action={
                <ReviewMenuButton
                  review={review}
                  currentProfile={profile}
                  onReportClick={() => setIssueDialogOpen(true)}
                  onEditClick={() => setEditDialogOpen(true)}
                  onDeleteClick={() => setDeleteDialogOpen(true)}
                  hideDetail
                />
              }
            />
            <CardContent sx={{ py: 0 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {review.name}
              </Typography>

              <Typography component="p" gutterBottom>
                {review.comment}
              </Typography>

              {review.images.length > 0 && <ReviewImageList review={review} />}
            </CardContent>
            <ReviewCardActions review={review} onCommentAdded={mutate} />

            {review.comments.length > 0 && (
              <CardContent>
                <ReviewComments comments={review.comments} onDeleted={mutate} />
              </CardContent>
            )}
            <div />
          </Card>

          <Box sx={{ mt: 2 }}>
            {review && (
              <Button
                color="secondary"
                startIcon={<KeyboardArrowLeft />}
                LinkComponent={Link}
                href={`/maps/${mapId}`}
              >
                {dictionary['back to map']}
              </Button>
            )}
          </Box>
        </>
      )}

      <EditReviewDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentReview={review}
        onSaved={mutate}
      />

      <DeleteReviewDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        review={review}
        onDeleted={router.reload}
      />

      <IssueDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        contentType="review"
        contentId={review ? review.id : null}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  res,
  params,
  locale
}) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=300'
  );

  const request = new Request(
    `${process.env.API_ENDPOINT}/guest/reviews/${params?.reviewId}`,
    {
      method: 'GET',
      headers: new Headers({
        Accept: 'application/json',
        'Accept-Language': locale,
        'Content-Type': 'application/json'
      })
    }
  );

  const response = await fetch(request);
  const data = await response.json();

  return {
    props: {
      review: response.ok ? data : null
    }
  };
};

ReviewPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout hideBottomNav>{page}</Layout>;
};

export default ReviewPage;
