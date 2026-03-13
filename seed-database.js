import dotenv from "dotenv";
import { db } from "./src/models/db.js";
import { categoryMongoStore } from "./src/models/mongo/category-mongo-store.js";
import { museumJsonStore } from "./src/models/json/museum-json-store.js";
import { exhibitionJsonStore } from "./src/models/json/exhibition-json-store.js";

dotenv.config();
db.init("mongo");

const seedUsers = [
    { id: "47462d66-5bd7-4c51-a208-087e292d563c", name: "Homer Simpson" },
    { id: "82b9f2b9-5dc3-48cb-ab6f-c7549c94a248", name: "Marge Simpson" },
    { id: "1bddc035-02fc-4d22-a987-89a7573ba5b2", name: "Lisa Simpson" },
  ];

  
  // === CATEGORY HELPERS ===
  /**
   * Ensure If Category already exist, won't create a new inforamtion, it will return the current one.
   * @param {*} name 
   * @param {*} location 
   * @param {*} description 
   * @returns return the new Information added in the database or return the current one, if already exists.
   */
  async function ensureCategory(name, location, description = "") {
    const existing = await categoryMongoStore.getAllCategories();
    const found = existing.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (found) return found;
    return categoryMongoStore.addCategory({ name, location, description });
  }
  
  async function seedCategories() {
    const art = await ensureCategory("Art", "Global", "Creative arts and visual culture");
    const history = await ensureCategory("History", "Global", "Historical collections and artifacts");
    const science = await ensureCategory("Science", "Global", "Science and technology exhibits");
    return { artId: art._id, historyId: history._id, scienceId: science._id };
  }
  
  // === MUSEUM HELPERS ===
  /**
   * Ensure If MUSEUM already exist, won't create a new inforamtion, it will return the current one.
   * @param {*} museumData 
   * @returns return the new Information added in the database or return the current one, if already exists.
   */
  async function ensureMuseum(museumData) {
    const museums = await museumJsonStore.getAllMuseums();
    const found = museums.find((m) => m.userid === museumData.userid && m.title === museumData.title);
    if (found) return found;
    return museumJsonStore.addMuseum(museumData);
  }
  
  async function seedHomerMuseums(categoryIds) {
    const homerId = "47462d66-5bd7-4c51-a208-087e292d563c";
    
    const museum1 = await ensureMuseum({
      userid: homerId, title: "Modern Art Gallery", 
      description: "Contemporary art from the 21st century",
      categoryId: categoryIds.artId, 
      latitude: 52.489471, 
      longitude: -1.898575
    });
    
    const museum2 = await ensureMuseum({
      userid: homerId, 
      title: "World War Museum", 
      description: "WW1 and WW2 artifacts and stories",
      categoryId: categoryIds.historyId, 
      latitude: 52.491234, 
      longitude: -1.895432
    });
    
    const museum3 = await ensureMuseum({
      userid: homerId, 
      title: "Natural History Museum", 
      description: "Dinosaurs, fossils, and natural wonders",
      categoryId: categoryIds.scienceId, 
      latitude: 52.487654, 
      longitude: -1.901234
    });
    
    const museum4 = await ensureMuseum({
      userid: homerId, 
      title: "Aviation Museum", 
      description: "History of flight and aircraft",
      categoryId: categoryIds.historyId, 
      latitude: 52.494321, 
      longitude: -1.889876
    });
    
    const museum5 = await ensureMuseum({
      userid: homerId, 
      title: "Space Exploration Center", 
      description: "Journey through space history",
      categoryId: categoryIds.scienceId, 
      latitude: 52.485678, 
      longitude: -1.903456
    });
    
    return [museum1, museum2, museum3, museum4, museum5];
  }
  
  async function seedMargeMuseums(categoryIds) {
    const margeId = "82b9f2b9-5dc3-48cb-ab6f-c7549c94a248";
    
    const museum1 = await ensureMuseum({
      userid: margeId, 
      title: "Classical Art Museum", 
      description: "Renaissance and classical masterpieces",
      categoryId: categoryIds.artId, 
      latitude: 52.488123, 
      longitude: -1.897654
    });
    
    const museum2 = await ensureMuseum({
      userid: margeId, 
      title: "Ancient Civilizations", 
      description: "Egypt, Greece, and Rome artifacts",
      categoryId: categoryIds.historyId, 
      latitude: 52.492345, 
      longitude: -1.894321
    });
    
    const museum3 = await ensureMuseum({
      userid: margeId, 
      title: "Marine Biology Center", 
      description: "Ocean life and conservation",
      categoryId: categoryIds.scienceId, 
      latitude: 52.486789, 
      longitude: -1.902345
    });
    
    const museum4 = await ensureMuseum({
      userid: margeId, 
      title: "Impressionist Gallery", 
      description: "Monet, Renoir, and French impressionists",
      categoryId: categoryIds.artId, 
      latitude: 52.490123, 
      longitude: -1.896789
    });
    
    return [museum1, museum2, museum3, museum4];
  }
  
  async function seedLisaMuseums(categoryIds) {
    const lisaId = "1bddc035-02fc-4d22-a987-89a7573ba5b2";
    
    const museum1 = await ensureMuseum({
      userid: lisaId, 
      title: "Environmental Science Center", 
      description: "Climate change and sustainability",
      categoryId: categoryIds.scienceId, 
      latitude: 52.487890, 
      longitude: -1.900123
    });
    
    const museum2 = await ensureMuseum({
      userid: lisaId, 
      title: "Jazz Museum", 
      description: "History of jazz music and legends",
      categoryId: categoryIds.artId, 
      latitude: 52.493456, 
      longitude: -1.891234
    });
    
    const museum3 = await ensureMuseum({
      userid: lisaId, 
      title: "Women's History Museum", 
      description: "Celebrating women's achievements",
      categoryId: categoryIds.historyId, 
      latitude: 52.489012, 
      longitude: -1.899876
    });
    
    return [museum1, museum2, museum3];
  }
  
  // === EXHIBITION HELPERS ===
  async function ensureExhibition(museumId, exhibitionData) {
    const exhibitions = await exhibitionJsonStore.getAllExhibitions();
    const found = exhibitions.find((e) => e.museumid === museumId && e.title === exhibitionData.title);
    if (found) return found;
    return exhibitionJsonStore.addExhibition(museumId, exhibitionData);
  }
  
  async function seedExhibitions(museums) {
    // Homer's museums exhibitions
    await ensureExhibition(museums.homer[0]._id, {
      title: "Abstract Expressions", 
      description: "Modern abstract paintings",
      startDate: "2026-04-01", 
      endDate: "2026-06-30"
    });
    await ensureExhibition(museums.homer[0]._id, {
      title: "Digital Art Revolution", 
      description: "NFTs and digital creativity",
      startDate: "2026-07-01", 
      endDate: "2026-09-30"
    });
    
    await ensureExhibition(museums.homer[1]._id, {
      title: "D-Day Stories", 
      description: "Personal accounts from Normandy",
      startDate: "2026-05-01", 
      endDate: "2026-08-31"
    });
    await ensureExhibition(museums.homer[1]._id, {
      title: "Home Front Life", 
      description: "Civilian life during wartime",
      startDate: "2026-09-01", 
      endDate: "2026-12-31"
    });
    
    await ensureExhibition(museums.homer[2]._id, {
      title: "Age of Dinosaurs", 
      description: "Jurassic period fossils",
      startDate: "2026-03-01", 
      endDate: "2026-12-31"
    });
    
    await ensureExhibition(museums.homer[3]._id, {
      title: "Wright Brothers Legacy", 
      description: "First powered flight",
      startDate: "2026-06-01", 
      endDate: "2026-10-31"
    });
    
    await ensureExhibition(museums.homer[4]._id, {
      title: "Moon Landing 60 Years", 
      description: "Apollo 11 anniversary",
      startDate: "2026-07-20", 
      endDate: "2026-12-31"
    });
    
    // Marge's museums exhibitions
    await ensureExhibition(museums.marge[0]._id, {
      title: "Renaissance Masters", 
      description: "Da Vinci and Michelangelo",
      startDate: "2026-04-15", 
      endDate: "2026-08-15"
    });
    await ensureExhibition(museums.marge[0]._id, {
      title: "Baroque Beauty", 
      description: "17th century European art",
      startDate: "2026-09-01", 
      endDate: "2027-01-31"
    });
    
    await ensureExhibition(museums.marge[1]._id, {
      title: "Pharaohs of Egypt", 
      description: "Tutankhamun and ancient rulers",
      startDate: "2026-05-01", 
      endDate: "2026-10-31"
    });
    
    await ensureExhibition(museums.marge[2]._id, {
      title: "Coral Reefs in Crisis", 
      description: "Ocean conservation efforts",
      startDate: "2026-06-08", 
      endDate: "2026-12-31"
    });
    
    await ensureExhibition(museums.marge[3]._id, {
      title: "Monet's Water Lilies", 
      description: "Impressionist garden series",
      startDate: "2026-03-01", 
      endDate: "2026-07-31"
    });
    
    // Lisa's museums exhibitions
    await ensureExhibition(museums.lisa[0]._id, {
      title: "Climate Solutions", 
      description: "Renewable energy innovations",
      startDate: "2026-04-22", 
      endDate: "2026-11-30"
    });
    await ensureExhibition(museums.lisa[0]._id, {
      title: "Plastic Ocean", 
      description: "Marine pollution awareness",
      startDate: "2026-06-05", 
      endDate: "2026-12-31"
    });
    
    await ensureExhibition(museums.lisa[1]._id, {
      title: "Miles Davis Tribute", 
      description: "The prince of jazz",
      startDate: "2026-05-26", 
      endDate: "2026-09-26"
    });
    
    await ensureExhibition(museums.lisa[2]._id, {
      title: "Suffragette Movement", 
      description: "Women's voting rights history",
      startDate: "2026-03-08", 
      endDate: "2026-08-26"
    });
  }
  
  // === MAIN SEED FUNCTION ===
  async function seed() {
    console.log("🌱 Starting database seed...");
    
    const categoryIds = await seedCategories();
    console.log("✅ Categories ready");
    
    const homerMuseums = await seedHomerMuseums(categoryIds);
    console.log(`✅ Seeded ${homerMuseums.length} museums for Homer`);
    
    const margeMuseums = await seedMargeMuseums(categoryIds);
    console.log(`✅ Seeded ${margeMuseums.length} museums for Marge`);
    
    const lisaMuseums = await seedLisaMuseums(categoryIds);
    console.log(`✅ Seeded ${lisaMuseums.length} museums for Lisa`);
    
    await seedExhibitions(
      {
        homer: homerMuseums,
        marge: margeMuseums,
        lisa: lisaMuseums
      }
    );
    console.log("✅ Exhibitions seeded");
  }
  
  seed()
    .then(() => {
      console.log("🎉 Seed complete!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });