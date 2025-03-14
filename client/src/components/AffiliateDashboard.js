import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AffiliateDashboard() {
  const [affiliate, setAffiliate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAffiliateData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/affiliates/me`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setAffiliate(res.data);
      } catch (error) {
        console.error('Error fetching affiliate data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAffiliateData();
  }, []);

  if (loading) return <p>Loading affiliate data...</p>;
  if (!affiliate) return <p>No affiliate data found.</p>;

  return (
    <div>
      <h2>Affiliate Dashboard</h2>
      <p>Your Earnings: ${affiliate.earnings.toFixed(2)}</p>
      <p>Your Affiliate Code: {affiliate.affiliateCode}</p>
      {/* Additional affiliate details can be added here */}
    </div>
  );
}
