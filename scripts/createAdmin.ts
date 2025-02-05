import { auth, db } from '../src/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

async function createAdminUser() {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'dominic.platten@gmail.com',
      '1234!A'
    );

    // Create admin document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: 'dominic.platten@gmail.com',
      isAdmin: true,
      createdAt: new Date().toISOString(),
    });

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();