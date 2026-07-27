import Banner from '../models/Banner.js';

// @desc    Get all banners (Admin)
// @route   GET /api/banners
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch banners' });
  }
};

// @desc    Get active banners for student/home dashboard
// @route   GET /api/banners/active
export const getActiveBanners = async (req, res) => {
  try {
    const activeBanners = await Banner.find({ $or: [{ status: 'Active' }, { active: true }] }).sort({ createdAt: -1 });
    res.json(activeBanners);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch active banners' });
  }
};

// @desc    Create a new banner
// @route   POST /api/banners
export const createBanner = async (req, res) => {
  try {
    const { title, imageUrl, link, targeting, scheduleType, startDate, endDate, status, placement } = req.body;
    
    if (!title || !imageUrl) {
      return res.status(400).json({ message: 'Title and Image URL are required.' });
    }

    const banner = await Banner.create({
      title,
      imageUrl,
      link: link || '',
      targeting: targeting || 'Prospective Students',
      scheduleType: scheduleType || 'Permanent',
      startDate: startDate || '',
      endDate: endDate || '',
      status: status || 'Active',
      placement: placement || 'dashboard',
      active: status === 'Active'
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create banner' });
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    const { title, imageUrl, link, targeting, scheduleType, startDate, endDate, status, placement, active } = req.body;

    banner.title = title !== undefined ? title : banner.title;
    banner.imageUrl = imageUrl !== undefined ? imageUrl : banner.imageUrl;
    banner.link = link !== undefined ? link : banner.link;
    banner.targeting = targeting !== undefined ? targeting : banner.targeting;
    banner.scheduleType = scheduleType !== undefined ? scheduleType : banner.scheduleType;
    banner.startDate = startDate !== undefined ? startDate : banner.startDate;
    banner.endDate = endDate !== undefined ? endDate : banner.endDate;
    banner.status = status !== undefined ? status : banner.status;
    banner.placement = placement !== undefined ? placement : banner.placement;
    banner.active = active !== undefined ? active : (banner.status === 'Active');

    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update banner' });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    await banner.deleteOne();
    res.json({ message: 'Banner removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete banner' });
  }
};
