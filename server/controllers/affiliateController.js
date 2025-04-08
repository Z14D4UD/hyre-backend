// server/controllers/affiliateController.js

const Affiliate = require('../models/Affiliate');

// Existing function for stats:
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
      recentActivity: [] // populate with real activity if available
    };

    res.json(data);
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({ msg: 'Server error fetching affiliate stats' });
  }
};

// New: Get Affiliate Profile – mirrors the customer profile GET endpoint
exports.getAffiliateProfile = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliate.id);
    if (!affiliate) {
      return res.status(404).json({ msg: 'Affiliate not found' });
    }
    res.json(affiliate);
  } catch (error) {
    console.error('Error fetching affiliate profile:', error);
    res.status(500).json({ msg: 'Server error fetching affiliate profile' });
  }
};

// New: Update Affiliate Profile – mirrors the customer profile update logic
// (If you need to handle file uploads for an avatar, you can integrate multer or similar middleware here.)
exports.updateAffiliateProfile = async (req, res) => {
  try {
    // Extract fields from the request body that affiliates are allowed to update.
    const { name, email, location, aboutMe, phoneNumber } = req.body;
    // You can expand this list as needed.
    const updatedAffiliate = await Affiliate.findByIdAndUpdate(
      req.affiliate.id,
      { name, email, location, aboutMe, phoneNumber },
      { new: true }
    );
    if (!updatedAffiliate) {
      return res.status(404).json({ msg: 'Affiliate not found' });
    }
    res.json(updatedAffiliate);
  } catch (error) {
    console.error('Error updating affiliate profile:', error);
    res.status(500).json({ msg: 'Server error updating affiliate profile' });
  }
};
