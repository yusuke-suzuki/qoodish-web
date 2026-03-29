'use client';

import { useContext } from 'react';
import type { Review } from '../../../types';
import Layout from '../../components/Layout';
import Timeline from '../../components/home/Timeline';
import TrendingReviews from '../../components/home/TrendingReviews';
import AuthContext from '../../context/AuthContext';

type Props = {
  popularReviews: Review[];
};

export default function HomePageClient({ popularReviews }: Props) {
  const { currentUser, isLoading } = useContext(AuthContext);

  return (
    <Layout>
      {!isLoading && !currentUser && (
        <TrendingReviews reviews={popularReviews} />
      )}
      {!isLoading && currentUser && <Timeline />}
    </Layout>
  );
}
