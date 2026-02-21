import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProfitLossDashboard from '../components/profitloss/ProfitLossDashboard';

const NewProfitLossPage = () => {
  return (
    <>
      <Helmet>
        <title>Profit & Loss Analytics - Slay Season</title>
        <meta name="description" content="Real-time profit tracking across all channels and products with beautiful Apple-level design and instant insights." />
      </Helmet>
      <ProfitLossDashboard />
    </>
  );
};

export default NewProfitLossPage;