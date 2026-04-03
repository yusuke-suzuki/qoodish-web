'use client';

import { useContext } from 'react';
import type { AppMap, Review } from '../../../types';
import Layout from '../../components/Layout';
import Timeline from '../../components/home/Timeline';
import TrendingReviews from '../../components/home/TrendingReviews';
import Sidebar from '../../components/layouts/Sidebar';
import AuthContext from '../../context/AuthContext';

type Props = {
  popularMaps: AppMap[];
  popularReviews: Review[];
};

export default function HomePageClient({ popularMaps, popularReviews }: Props) {
  const { currentUser, isLoading } = useContext(AuthContext);

  return (
    <Layout sidebar={<Sidebar popularMaps={popularMaps} />}>
      {!isLoading && !currentUser && (
        <TrendingReviews reviews={popularReviews} />
      )}
      {!isLoading && currentUser && <Timeline />}
    </Layout>
  );
}
