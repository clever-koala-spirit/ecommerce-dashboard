import React from 'react';
import { Helmet } from 'react-helmet-async';
import AttributionDashboard from '../components/attribution/AttributionDashboard';

const AttributionPage = () => {
  return (
    <>
      <Helmet>
        <title>Attribution Analytics - Slay Season</title>
        <meta name="description" content="Multi-touch attribution across all marketing channels with Apple-level design and zero-learning-curve usability." />
      </Helmet>
      <AttributionDashboard />
    </>
  );
};

export default AttributionPage;