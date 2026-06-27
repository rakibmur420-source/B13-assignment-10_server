require('dotenv').config();
const mongoose = require('mongoose');
const Ebook = require('./models/Ebook');
const User = require('./models/User');

const SEED_BOOKS = [
  {
    title: "The Last Ember of Valtheria",
    description: "A botanist discovers flowers that preserve memories of the dead, leading her on a journey through a world on the brink of collapse.",
    content: "In the highlands of Valtheria, where the mist never fully lifted, Dr. Elara Voss found the first bloom...",
    price: 12.99,
    genre: "Fantasy",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    status: "published",
  },
  {
    title: "Whispers in Ash",
    description: "A detective hunts a serial killer through the fog of a dying city, only to discover the killer may be someone she trusts.",
    content: "Detective Maya Reyes stepped over the chalk outline, her breath visible in the cold morning air...",
    price: 9.99,
    genre: "Mystery",
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    status: "published",
  },
  {
    title: "Orbit of Dreams",
    description: "Two astronauts fall in love on a mission to the edge of the solar system, knowing only one of them will return.",
    content: "The stars outside the viewport were impossibly bright. Commander Lena Zhao floated toward the observation deck...",
    price: 11.50,
    genre: "Sci-Fi",
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    status: "published",
  },
  {
    title: "Moonlit Letters",
    description: "Two strangers exchange anonymous letters that slowly transform their lives and lead them to unexpected love.",
    content: "The first letter arrived on a Tuesday, slipped under the door of apartment 4B with no return address...",
    price: 9.99,
    genre: "Romance",
    coverImage: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=600&fit=crop",
    status: "published",
  },
  {
    title: "The Garden of Forgotten Stars",
    description: "A young gardener uncovers an ancient secret buried beneath a centuries-old estate that could rewrite history.",
    content: "The estate had been abandoned for forty years when Nora first pushed open its iron gates...",
    price: 10.99,
    genre: "Mystery",
    coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop",
    status: "published",
  },
  {
    title: "Echoes of Tomorrow",
    description: "A scientist travels back in time only to find the future has already changed in ways she cannot control.",
    content: "The machine hummed to life at exactly 3:17 AM. Dr. Sarah Chen checked her coordinates one final time...",
    price: 13.50,
    genre: "Sci-Fi",
    coverImage: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&h=600&fit=crop",
    status: "published",
  },
  {
    title: "The Clockmaker's Promise",
    description: "A clockmaker discovers his creations hold the power to stop time — and one wrong tick could end the world.",
    content: "Every clock in the shop ticked in perfect unison. That was how Elias liked it — precise, predictable, safe...",
    price: 8.99,
    genre: "Fiction",
    coverImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
    status: "published",
  },
  {
    title: "Midnight Library",
    description: "Between life and death there is a library, and each book is a different life you could have lived.",
    content: "The library appeared at midnight, as it always did. Nora stood at the entrance, her heart pounding...",
    price: 14.99,
    genre: "Fiction",
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop",
    status: "published",
  },
];

async function seedBooks() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');

  // Find admin or first writer to assign as author
  let writer = await User.findOne({ role: 'writer' });
  if (!writer) {
    writer = await User.findOne({ role: 'admin' });
  }
  if (!writer) {
    console.log('No writer or admin found. Please create a writer account first.');
    process.exit(1);
  }

  console.log(`Using writer: ${writer.name} (${writer.email})`);

  let added = 0;
  for (const book of SEED_BOOKS) {
    const exists = await Ebook.findOne({ title: book.title });
    if (exists) {
      console.log(`Skipping (already exists): ${book.title}`);
      continue;
    }
    await Ebook.create({
      ...book,
      writer: writer._id,
      writerName: writer.name,
    });
    console.log(`Added: ${book.title}`);
    added++;
  }

  console.log(`\n✅ Done! Added ${added} books.`);
  process.exit(0);
}

seedBooks().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
