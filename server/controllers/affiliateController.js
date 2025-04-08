// server/controllers/affiliateController.js

const Affiliate = require('../models/Affiliate');

exports.getAffiliateStats = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliate.id);
    if (!affiliate) {
      return res.status(404).json({ msg: 'Affiliate not found' });
    }

    const data = {
      last30Days: {
        referrals: affiliate.recentReferrals || 0,
        visits: affiliate.recentVisits || 0,
        conversions: affiliate.conversions || 0,
      },
      allTime: {
        referrals: affiliate.referrals || 0,
        paidReferrals: affiliate.paidReferrals || 0,
        unpaidEarnings: affiliate.unpaidEarnings || 0,
        totalEarnings: affiliate.totalEarnings || 0,
      },
      affiliateCode: affiliate.affiliateCode,  // the unique code for referrals
      recentActivity: [] // populate with real activity if you track it
    };

    res.json(data);
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({ msg: 'Server error fetching affiliate stats' });
  }
};
