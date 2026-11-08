const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Event = require('./models/Event');
const Submission = require('./models/Submission');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/code_similarity_db';

const eventsList = [
  {
    title: "ByteCode Hackathon 2026",
    description: "A fast-paced algorithmic and syntactic programming challenge designed to test your logical thinking and fundamentals in Python, JavaScript, and C++.",
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    difficulty: "Beginner",
    location: "Virtual",
    tags: ["Algorithms", "Python", "JavaScript"]
  },
  {
    title: "Dynamic Programming Showdown",
    description: "Tackle 5 complex optimization and recursive challenges where optimal substructures rule. Ideal for students preparing for competitive programming contests.",
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    difficulty: "Advanced",
    location: "San Francisco, CA & Hybrid",
    tags: ["Algorithms", "DP", "Competitive"]
  },
  {
    title: "DeepDev Generative AI Hackathon",
    description: "Form teams and build innovative productivity and helper tools utilizing large language models, image generators, and multi-modal neural network APIs.",
    date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    difficulty: "Intermediate",
    location: "Virtual",
    tags: ["AI", "LLMs", "Node.js"]
  },
  {
    title: "CyberSec Capture The Flag (CTF)",
    description: "An intensive security exploration event. Solve puzzles in cryptography, reverse engineering, web exploitation, and binary forensics to capture flags.",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    difficulty: "Advanced",
    location: "Austin, TX Office",
    tags: ["Cybersecurity", "Cryptography", "Linux"]
  },
  {
    title: "CodeRush Speedcoding Clash",
    description: "Tick-tock! Solve 10 small syntax and logical puzzle problems with a strictly limited runtime. High speed, high pressure, and maximum focus.",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    difficulty: "Beginner",
    location: "Virtual",
    tags: ["Speedcoding", "C++", "Java"]
  },
  {
    title: "React & CSS Responsive UI Battle",
    description: "Focus on design systems, component reusability, smooth layout shifts, and micro-interactions. Bring your CSS chops and React state magic.",
    date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    difficulty: "Intermediate",
    location: "Virtual",
    tags: ["Frontend", "React", "CSS"]
  },
  {
    title: "Mojo Python Automation Sprint",
    description: "Build robust backend crawlers, automated scripting systems, or data cleaning pipelines using standard scripting tools. Speed and cleanliness of code counts.",
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    difficulty: "Beginner",
    location: "Virtual",
    tags: ["Python", "Automation", "Scripts"]
  },
  {
    title: "Predictive Analytics Datathon",
    description: "Analyze large-scale tabular data and construct predictive machine learning models to forecast pricing models, user churn rates, and retail inventory flows.",
    date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    difficulty: "Intermediate",
    location: "New York, NY",
    tags: ["Data Science", "Machine Learning", "R"]
  },
  {
    title: "Quantum Algorithms Hackathon",
    description: "Discover quantum computing! Get introduced to Qiskit and write simple quantum circuits that resolve basic simulation problems using quantum states.",
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    difficulty: "Advanced",
    location: "Virtual",
    tags: ["Quantum", "Qiskit", "Physics"]
  },
  {
    title: "60-Hour Web Game Jam",
    description: "Develop an engaging browser-based video game within 60 hours using Phaser, Three.js, or raw HTML5 canvas. Sound, playability, and UI will be judged.",
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    difficulty: "Intermediate",
    location: "Virtual",
    tags: ["Game Dev", "HTML5", "Phaser"]
  },
  {
    title: "SmartContract Web3 Security Sprint",
    description: "Write and test Solidity smart contracts. Find exploits in sample DeFi contracts, fix gas inefficiencies, and compile clean ERC20 protocols.",
    date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    difficulty: "Advanced",
    location: "Virtual",
    tags: ["Solidity", "Blockchain", "Web3"]
  },
  {
    title: "IoT Smart Home Prototyping",
    description: "An offline maker space event connecting microcontrollers (Raspberry Pi/Arduino) to MQTT queues to report environmental conditions in real time.",
    date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    difficulty: "Intermediate",
    location: "Seattle, WA Maker Space",
    tags: ["IoT", "Arduino", "Embedded"]
  },
  {
    title: "Linux Kernel Bug Squash Weekend",
    description: "Identify resource leaks and optimize performance blocks inside virtualized device drivers. Excellent for low-level systems engineers.",
    date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    difficulty: "Advanced",
    location: "Virtual",
    tags: ["C", "Kernel", "Linux"]
  }
];

async function seedData() {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Database connected.');

    // Clear existing data
    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Event.deleteMany();
    await Submission.deleteMany();
    console.log('Database cleared.');

    // Create a mock organizer user
    console.log('Creating default organizer user...');
    const organizer = new User({
      username: "DevOrganizer",
      email: "organizer@hackathon.com",
      password: "password123", // Will be hashed automatically by pre-save
      bio: "Lead event coordinator and developer advocate at HackGlobal.",
      skills: ["Node.js", "React.js", "MongoDB", "Event Management"]
    });
    await organizer.save();
    console.log('Default organizer user created successfully.');

    // Populate events
    console.log('Creating 13 sample hackathon and coding events...');
    const populatedEvents = eventsList.map(event => ({
      ...event,
      organizer: organizer._id
    }));

    await Event.insertMany(populatedEvents);
    console.log('13 events seeded successfully.');

    console.log('Database seeding process completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during database seeding:', err.message);
    process.exit(1);
  }
}

seedData();
