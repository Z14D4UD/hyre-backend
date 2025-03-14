const Affiliate = require('../models/Affiliate');

exports.getAffiliateData = async (req, res) => {
  try {
    // Assuming auth middleware sets req.affiliate based on JWT payload for affiliate users
    const affiliate = await Affiliate.findById(req.affiliate.id);
    if (!affiliate) return res.status(404).json({ msg: 'Affiliate not found' });
    res.json(affiliate);
  } catch (error) {
    console.error('Error fetching affiliate data:', error);
    res.status(500).send('Server error');
  }
};
