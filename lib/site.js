// Single source of truth for business details used by the pages and emails.
// Edit here (or via env) – nothing else in the codebase hardcodes contact info.
module.exports = {
  name: 'McCauley Stoneworks & Craft',
  phone: '(207) 408-2811',
  phoneHref: 'tel:+12074082811',
  email: 'mccauleystoneworksllc@gmail.com',
  area: 'York & Cumberland Counties, Maine',
  base: 'Portland, ME',
  yearsExperience: 15,
  socials: {
    facebook: 'https://www.facebook.com/profile.php?id=61588875123586',
    instagram: process.env.SOCIAL_INSTAGRAM || '',
    tiktok: process.env.SOCIAL_TIKTOK || '',
    youtube: process.env.SOCIAL_YOUTUBE || ''
  },
  projectTypes: [
    'Patio', 'Walkway / Steps', 'Stone or Block Wall', 'Fire Pit',
    'Flagstone', 'Stone Veneer', 'Interior Tile', 'Not sure yet'
  ]
};
