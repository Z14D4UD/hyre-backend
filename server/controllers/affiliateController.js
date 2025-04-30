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
        referrals: affiliate.recentReferrals   || 0,
        visits:    affiliate.recentVisits      || 0,
        conversions: affiliate.conversions     || 0,
      },
      allTime: {
        referrals:      affiliate.referrals      || 0,
        paidReferrals:  affiliate.paidReferrals  || 0,
        unpaidEarnings: affiliate.unpaidEarnings || 0,
        totalEarnings:  affiliate.totalEarnings  || 0,
      },
      pendingBalance:   affiliate.pendingBalance   || 0,  // ← new
      availableBalance: affiliate.availableBalance || 0,  // ← new
      affiliateCode:    affiliate.affiliateCode,
      recentActivity:   [] // populate with real activity if available
    };

    res.json(data);
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({ msg: 'Server error fetching affiliate stats' });
  }
};

// Get Affiliate Profile – mirrors the customer profile GET endpoint
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

// Update Affiliate Profile – now handles file uploads for avatar
exports.updateAffiliateProfile = async (req, res) => {
  try {
    console.log('Received update affiliate profile request:');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const { name, email, location, aboutMe, phoneNumber } = req.body;

    let updateData = { name, email, location, aboutMe, phoneNumber };

    if (req.file) {
      updateData.avatarUrl = req.file.path.replace(/\\/g, '/');
      console.log('Updating avatarUrl with file path:', updateData.avatarUrl);
    }

    const updatedAffiliate = await Affiliate.findByIdAndUpdate(
      req.affiliate.id,
      updateData,
      { new: true }
    );
    
    if (!updatedAffiliate) {
      return res.status(404).json({ msg: 'Affiliate not found' });
    }
    console.log('Updated Affiliate:', updatedAffiliate);
    res.json(updatedAffiliate);
  } catch (error) {
    console.error('Error updating affiliate profile:', error);
    res.status(500).json({ msg: 'Server error updating affiliate profile' });
  }
};
