import { useEffect, useCallback, useState, useContext, memo } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import { ApiClient, ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';

import ReviewCard from '../../../../components/molecules/ReviewCard';
import NoContents from '../../../../components/molecules/NoContents';
import AuthContext from '../../../../context/AuthContext';
import fetchReview from '../../../../actions/fetchReview';
import openToast from '../../../../actions/openToast';
import SkeletonReviewCard from '../../../../components/molecules/SkeletonReviewCard';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../../../components/Layout';
import Head from 'next/head';
import { Button, makeStyles } from '@material-ui/core';
import { GetServerSideProps } from 'next';
import { Image, Map, PrismaClient, Review, Spot } from '@prisma/client';

import path from 'path';
import { useLocale } from '../../../../hooks/useLocale';
import {
  Client,
  Language,
  PlaceData
} from '@googlemaps/google-maps-services-js';
import { KeyboardArrowLeft } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  backButtonContainer: {
    marginTop: theme.spacing(2)
  }
}));

type Props = {
  isPrivate: boolean;
  review:
    | (Review & {
        map: Map;
        spot: Spot;
        images: Image[];
      })
    | null;
  placeData: PlaceData;
  thumbnailUrl: string;
};

const ReviewPage = (props: Props) => {
  const { isPrivate, review, placeData, thumbnailUrl } = props;

  const { I18n } = useLocale();

  const router = useRouter();
  const { mapId, reviewId } = router.query;

  const classes = useStyles();
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      currentReview: state.reviewDetail.currentReview
    }),
    []
  );
  const { currentReview } = useMappedState(mapState);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useContext(AuthContext);

  const initReview = useCallback(async () => {
    setLoading(true);
    const apiInstance = new ReviewsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.mapsMapIdReviewsReviewIdGet(
      mapId,
      reviewId,
      (error, data, response) => {
        setLoading(false);

        if (response.ok) {
          dispatch(fetchReview(response.body));
        } else if (response.status == 401) {
          dispatch(openToast('Authenticate failed'));
        } else if (response.status == 404) {
          dispatch(openToast('Report not found.'));
        } else {
          dispatch(openToast('Failed to fetch Report.'));
        }
      }
    );
  }, [currentReview, dispatch, currentUser, mapId, reviewId]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }

    if (mapId && reviewId) {
      initReview();
    }
  }, [currentUser, mapId, reviewId]);

  const title = isPrivate
    ? 'Qoodish'
    : `${placeData.name} - ${review.map.name} | Qoodish`;
  const description = isPrivate ? I18n.t('meta description') : review.comment;
  const keywords =
    (isPrivate ? '' : `${review.map.name}, ${placeData.name}, `) +
    'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip';
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;

  return (
    <Layout hideBottomNav={true} fullWidth={false}>
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

        {isPrivate && <meta name="robots" content="noindex" />}

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
        <meta property="og:site_name" content={I18n.t('meta headline')} />
      </Head>

      {loading ? (
        <SkeletonReviewCard />
      ) : (
        <>
          {currentReview ? (
            <ReviewCard currentReview={currentReview} />
          ) : (
            <NoContents
              contentType="review"
              message={I18n.t('reports will see here')}
            />
          )}
          <div className={classes.backButtonContainer}>
            {currentReview && (
              <Link href={`/maps/${mapId}`} passHref>
                <Button color="primary" startIcon={<KeyboardArrowLeft />}>
                  {I18n.t('back to map')}
                </Button>
              </Link>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

const prisma = new PrismaClient();
const client = new Client();

export const getServerSideProps: GetServerSideProps = async ({
  res,
  params,
  locale
}) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=300'
  );

  const review = await prisma.review.findUnique({
    where: {
      id: Number(params.reviewId)
    },
    include: {
      map: true,
      spot: {
        include: {
          place: true
        }
      },
      images: true
    }
  });

  if (!review) {
    return {
      notFound: true
    };
  }

  const placeDetails = await client.placeDetails({
    params: {
      place_id: review.spot.place.place_id_val,
      language: Language[locale],
      key: process.env.GOOGLE_API_KEY
    }
  });

  const thumbnail = review.images[0];

  const isPrivate = review.map.private;

  return {
    props: {
      isPrivate: isPrivate,
      review: isPrivate
        ? null
        : JSON.parse(
            JSON.stringify(review, (_key, value) =>
              typeof value === 'bigint' ? Number(value) : value
            )
          ),
      placeData: isPrivate ? null : placeDetails.data.result,
      thumbnailUrl:
        isPrivate || !thumbnail
          ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL
          : `${process.env.NEXT_PUBLIC_CLOUD_STORAGE_ENDPOINT}/${
              process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
            }/images/thumbnails/${path.basename(
              thumbnail.url,
              path.extname(thumbnail.url)
            )}_800x800${path.extname(thumbnail.url)}`
    }
  };
};

export default memo(ReviewPage);
