import dotenv from "dotenv";
import { db } from "./src/models/db";

dotenv.config();

const defaultUsers = [
  {
    firstName: "Homer",
    lastName: "Simpson",
    email: "homer@simpson.com",
    password: "secret",
    role: "admin",
  },
  {
    firstName: "Marge",
    lastName: "Simpson",
    email: "marge@simpson.com",
    password: "secret",
    role: "admin",
  },
  {
    firstName: "Lisa",
    lastName: "Simpson",
    email: "lisa@simpson.com",
    password: "secret",
    role: "user",
  },
] as const;

async function ensureUser(user: (typeof defaultUsers)[number]) {
  const existing = await db.userStore.getUserByEmail(user.email);
  if (existing) {
    return existing;
  }
  return db.userStore.addUser({ ...user, _id: "" } as any);
}

async function ensureCategory(name: string, location: string, description = "") {
  const categories = await db.categoryStore.getAllCategories();
  const found = categories.find((category: any) => category.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  return db.categoryStore.addCategory({ name, location, description } as any);
}

async function ensureMuseum(museumData: any) {
  const museums = await db.museumStore.getAllMuseums();
  const found = museums.find((museum: any) => museum.userid === museumData.userid && museum.title === museumData.title);
  if (found) return found;
  return db.museumStore.addMuseum(museumData);
}

async function ensureExhibition(museumId: string, exhibitionData: any) {
  const exhibitions = await db.exhibitionStore.getAllExhibitions();
  const found = exhibitions.find((exhibition: any) => exhibition.museumid === museumId && exhibition.title === exhibitionData.title);
  if (found) return found;
  return db.exhibitionStore.addExhibition(museumId, exhibitionData);
}

async function main() {
  await db.init("mongo");
  console.log("Mongo storage mode activated and stores assigned.");

  const homer = await ensureUser(defaultUsers[0]);
  const marge = await ensureUser(defaultUsers[1]);
  const lisa = await ensureUser(defaultUsers[2]);

  const categories = {
    art: await ensureCategory("Art", "Global", "Creative arts and visual culture"),
    history: await ensureCategory("History", "Global", "Historical collections and artifacts"),
    science: await ensureCategory("Science", "Global", "Science and technology exhibits"),
  };

  const homerMuseums = [
    await ensureMuseum({ userid: homer._id, title: "Modern Art Gallery", description: "Contemporary art from the 21st century", categoryId: categories.art._id, latitude: 52.489471, longitude: -1.898575, status: "public" }),
    await ensureMuseum({ userid: homer._id, title: "World War Museum", description: "WW1 and WW2 artifacts and stories", categoryId: categories.history._id, latitude: 52.491234, longitude: -1.895432, status: "public" }),
    await ensureMuseum({ userid: homer._id, title: "Natural History Museum", description: "Dinosaurs, fossils, and natural wonders", categoryId: categories.science._id, latitude: 52.487654, longitude: -1.901234, status: "public" }),
    await ensureMuseum({ userid: homer._id, title: "Aviation Museum", description: "History of flight and aircraft", categoryId: categories.history._id, latitude: 52.494321, longitude: -1.889876, status: "public" }),
    await ensureMuseum({ userid: homer._id, title: "Space Exploration Center", description: "Journey through space history", categoryId: categories.science._id, latitude: 52.485678, longitude: -1.903456, status: "public" }),
  ];

  const margeMuseums = [
    await ensureMuseum({ userid: marge._id, title: "Classical Art Museum", description: "Renaissance and classical masterpieces", categoryId: categories.art._id, latitude: 52.488123, longitude: -1.897654, status: "public" }),
    await ensureMuseum({ userid: marge._id, title: "Ancient Civilizations", description: "Egypt, Greece, and Rome artifacts", categoryId: categories.history._id, latitude: 52.492345, longitude: -1.894321, status: "public" }),
    await ensureMuseum({ userid: marge._id, title: "Marine Biology Center", description: "Ocean life and conservation", categoryId: categories.science._id, latitude: 52.486789, longitude: -1.902345, status: "public" }),
    await ensureMuseum({ userid: marge._id, title: "Impressionist Gallery", description: "Monet, Renoir, and French impressionists", categoryId: categories.art._id, latitude: 52.490123, longitude: -1.896789, status: "public" }),
  ];

  const lisaMuseums = [
    await ensureMuseum({ userid: lisa._id, title: "Environmental Science Center", description: "Climate change and sustainability", categoryId: categories.science._id, latitude: 52.48789, longitude: -1.900123, status: "public" }),
    await ensureMuseum({ userid: lisa._id, title: "Jazz Museum", description: "History of jazz music and legends", categoryId: categories.art._id, latitude: 52.493456, longitude: -1.891234, status: "public" }),
    await ensureMuseum({ userid: lisa._id, title: "Women's History Museum", description: "Celebrating women's achievements", categoryId: categories.history._id, latitude: 52.489012, longitude: -1.899876, status: "public" }),
  ];

  await ensureExhibition(String(homerMuseums[0]._id), { title: "Abstract Expressions", description: "Modern abstract paintings", startDate: "2026-04-01", endDate: "2026-06-30" });
  await ensureExhibition(String(homerMuseums[1]._id), { title: "D-Day Stories", description: "Personal accounts from Normandy", startDate: "2026-05-01", endDate: "2026-08-31" });
  await ensureExhibition(String(margeMuseums[0]._id), { title: "Renaissance Masters", description: "Da Vinci and Michelangelo", startDate: "2026-04-15", endDate: "2026-08-15" });
  await ensureExhibition(String(lisaMuseums[0]._id), { title: "Climate Solutions", description: "Renewable energy innovations", startDate: "2026-04-22", endDate: "2026-11-30" });

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
