// server/controllers/affiliateController.js

const Affiliate = require('../models/Affiliate');

// GET /api/affiliate/stats
exports.getAffiliateStats = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliate.id);
    if (!affiliate) {
      return res.status(404).json({ msg: 'Affiliate not found' });
    }

    const data = {
      last30Days: {
        referrals:   affiliate.recentReferrals   || 0,
        visits:      affiliate.recentVisits      || 0,
        conversions: affiliate.conversions       || 0,
      },
      allTime: {
        referrals:      affiliate.referrals      || 0,
        paidReferrals:  affiliate.paidReferrals  || 0,
        unpaidEarnings: affiliate.unpaidEarnings || 0,
        totalEarnings:  affiliate.totalEarnings  || 0,
      },
      pendingBalance:   affiliate.pendingBalance   || 0,
      availableBalance: affiliate.availableBalance || 0,
      affiliateCode:    affiliate.affiliateCode,
      recentActivity:   [] // populate if you have it
    };

    res.json(data);
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({ msg: 'Server error fetching affiliate stats' });
  }
};

// GET /api/affiliate/profile
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

// PUT /api/affiliate/profile
exports.updateAffiliateProfile = async (req, res) => {
  try {
    const { name, email, location, aboutMe, phoneNumber } = req.body;
    const updateData = { name, email, location, aboutMe, phoneNumber };

    if (req.file) {
      // only use the filename (with extension); the /uploads middleware will serve it
      updateData.avatarUrl = `uploads/${req.file.filename}`;
    }

    const updatedAffiliate = await Affiliate.findByIdAndUpdate(
      req.affiliate.id,
      updateData,
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
