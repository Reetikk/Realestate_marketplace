require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/real_estate');
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const createSampleUser = async () => {
  const email = 'sampleowner@example.com';
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({
      name: 'Sample Owner',
      email,
      password: 'Sample123',
      number: '9999999999',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipcode: '400001',
      role: 'user'
    });
    await user.save();
    console.log('Created sample user:', email);
  } else {
    console.log('Sample user already exists:', email);
  }
  return user;
};

const seedProperties = async (userId) => {
  const properties = [
    {
      title: 'Luxury Sea View Apartment',
      description: 'A premium 3BHK apartment with panoramic sea views, modern amenities, and secure parking.',
      price: 25000000,
      address: 'Tower A, Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      bedrooms: 3,
      bathrooms: 3,
      square_foot: 1700,
      parking: '2 cars',
      property_type: 'Apartment',
      postedBy: userId,
      image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      cloudinary_id: 'sample_seaview_apartment'
    },
    {
      title: 'Cozy Family Villa',
      description: 'A spacious 4BHK villa with a private garden and easy access to schools and shopping centers.',
      price: 18000000,
      address: 'Green Meadows Road, Thane',
      city: 'Thane',
      state: 'Maharashtra',
      bedrooms: 4,
      bathrooms: 4,
      square_foot: 3200,
      parking: '3 cars',
      property_type: 'Villa',
      postedBy: userId,
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      cloudinary_id: 'sample_family_villa'
    },
    {
      title: 'Modern Studio Apartment',
      description: 'A compact studio apartment ideal for young professionals, located close to public transport.',
      price: 6500000,
      address: 'Sector 5, Navi Mumbai',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      bedrooms: 1,
      bathrooms: 1,
      square_foot: 550,
      parking: '1 car',
      property_type: 'Studio',
      postedBy: userId,
      image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
      cloudinary_id: 'sample_studio_apartment'
    }
  ];

  for (const prop of properties) {
    const existing = await Property.findOne({ title: prop.title });
    if (!existing) {
      await Property.create(prop);
      console.log('Inserted property:', prop.title);
    } else {
      console.log('Property already exists:', prop.title);
    }
  }
};

const run = async () => {
  await connectDB();
  const user = await createSampleUser();
  await seedProperties(user._id);
  console.log('Seeding completed');
  process.exit(0);
};

run();
