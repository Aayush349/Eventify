const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');

const seedData = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database.');

    let organizer = await User.findOne({});
    if (!organizer) {
      console.log('👤 Creating demo Organizer account...');
      organizer = await User.create({
        name: 'District Live Entertainment',
        email: 'organizer@district.app',
        password: 'Password@123',
        role: 'admin',
        isVerified: true,
      });
    }
    console.log(`🎟️ Using Organizer/Admin account: ${organizer.name} (${organizer.email})`);

    // Sample events list
    const eventsToInsert = [
      {
        title: 'Coldplay: Music of the Spheres Tour 2026',
        description: 'Experience the magical stadium tour featuring breathtaking fireworks, LED wristbands, and transcendent live performances of hit songs from Coldplay.',
        category: 'concerts',
        status: 'published',
        organizer: organizer._id,
        date: {
          start: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days ahead
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 4 * 3600 * 1000),
        },
        venue: {
          name: 'DY Patil Stadium',
          city: 'Navi Mumbai',
          address: 'Sector 7, Nerul, Navi Mumbai, Maharashtra 400706',
        },
        bannerImage: {
          url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
          publicId: 'demo/coldplay_concert_banner',
        },
        ticketTypes: [
          { name: 'VIP Platinum Lounge', price: 4999, totalSeats: 50, availableSeats: 48, description: 'Dedicated VIP entrance, lounge access, and complimentary refreshments.' },
          { name: 'Gold Arena Standing', price: 2499, totalSeats: 200, availableSeats: 185, description: 'Prime viewing area directly in front of the main stage.' },
          { name: 'General Tribune Stand', price: 1499, totalSeats: 500, availableSeats: 460, description: 'Reserved seating on stadium tiered levels.' },
        ],
        tags: ['coldplay', 'concert', 'mumbai', 'music', 'stadium'],
        minPrice: 1499,
      },
      {
        title: 'IPL 2026 Grand Finale: Championship Match',
        description: 'Witness cricketing grandeur at its finest! Watch the top two franchises collide in an electrifying final showdown under the lights at Wankhede Stadium.',
        category: 'sports',
        status: 'published',
        organizer: organizer._id,
        date: {
          start: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000 + 5 * 3600 * 1000),
        },
        venue: {
          name: 'Wankhede Stadium',
          city: 'Mumbai',
          address: 'D Road, Churchgate, Mumbai, Maharashtra 400020',
        },
        bannerImage: {
          url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
          publicId: 'demo/ipl_finale_banner',
        },
        ticketTypes: [
          { name: 'Club Pavilion Box', price: 7500, totalSeats: 30, availableSeats: 22, description: 'Air-conditioned hospitality suite with gourmet buffet dinner.' },
          { name: 'North Premium Stand', price: 3200, totalSeats: 150, availableSeats: 110, description: 'Covered tier seating with panoramic field sightlines.' },
          { name: 'East General Stand', price: 1200, totalSeats: 400, availableSeats: 380, description: 'Open-air stand atmosphere with enthusiastic cricket fans.' },
        ],
        tags: ['cricket', 'ipl', 'sports', 'wankhede', 'finals'],
        minPrice: 1200,
      },
      {
        title: 'Sunburn Goa 2026 • Electronic Music Festival',
        description: 'Asia’s premier electronic dance music extravaganza returns to the scenic beaches of Goa! Featuring world-renowned DJs, laser animations, and immersive art displays.',
        category: 'festival',
        status: 'published',
        organizer: organizer._id,
        date: {
          start: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 63 * 24 * 60 * 60 * 1000),
        },
        venue: {
          name: 'Vagator Beach Arena',
          city: 'Goa',
          address: 'North Goa Coastline, Vagator, Goa 403509',
        },
        bannerImage: {
          url: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&q=80',
          publicId: 'demo/sunburn_goa_banner',
        },
        ticketTypes: [
          { name: 'VIP 3-Day Festival Pass', price: 8999, totalSeats: 60, availableSeats: 55, description: 'All-access 3-day wristband with priority VIP bar and express festival gates.' },
          { name: 'General Day 1 & 2 Pass', price: 3499, totalSeats: 300, availableSeats: 290, description: 'General admission to all stages for Friday & Saturday.' },
        ],
        tags: ['sunburn', 'edm', 'festival', 'goa', 'dance', 'party'],
        minPrice: 3499,
      },
    ];

    console.log('📦 Seeding 3 District test events...');
    for (const data of eventsToInsert) {
      const existing = await Event.findOne({ title: data.title });
      if (!existing) {
        await Event.create(data);
        console.log(`   ✨ Created: ${data.title}`);
      } else {
        console.log(`   ⚖️ Event already exists: ${data.title}`);
      }
    }

    // Ensure all seeded events are featured so they appear immediately on the home & featured pages
    await Event.updateMany({}, { $set: { isFeatured: true, status: 'published' } });
    console.log('✨ All events marked as featured & published!');

    console.log('\n🎉 Database seeding complete! You are ready to test the application flow.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seedData();
