import { db } from "./firebase-init.js";

async function addDataToFirestore(museumId) {
    try {
      const docRef = await db.collection('museum_view').add({
        museum_id: 'Ada',
        total_view:0,
      });
      console.log('Document written with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }
  
  addDataToFirestore();
  


  async function readDataFromFirestore() {
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('born', '<', 1900).get();
  
      if (snapshot.empty) {
        console.log('No matching documents.');
        return;
      }
  
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
      });
    } catch (error) {
      console.error('Error getting documents: ', error);
    }
  }
  
  readDataFromFirestore();
  