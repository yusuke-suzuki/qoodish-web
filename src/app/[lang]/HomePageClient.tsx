'use client';

import { useContext } from 'react';
import Layout from '../../components/Layout';
import Timeline from '../../components/home/Timeline';
import TrendingReviews from '../../components/home/TrendingReviews';
import AuthContext from '../../context/AuthContext';

export default function HomePageClient() {
  const { currentUser, isLoading } = useContext(AuthContext);

  return (
    <Layout>
      {!isLoading && !currentUser && <TrendingReviews />}
      {!isLoading && currentUser && <Timeline />}
    </Layout>
  );
}
