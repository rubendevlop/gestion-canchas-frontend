import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';

const firebaseEnv = {
  apiKey: String(import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
  authDomain: String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
  projectId: String(import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
  storageBucket: String(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
  messagingSenderId: String(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId: String(import.meta.env.VITE_FIREBASE_APP_ID || '').trim(),
  measurementId: String(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '').trim(),
};

const requiredFirebaseEnvEntries = Object.entries(firebaseEnv).filter(
  ([key, value]) => key !== 'measurementId' && !value,
);

if (requiredFirebaseEnvEntries.length > 0) {
  const missingVars = requiredFirebaseEnvEntries.map(([key]) => `VITE_FIREBASE_${toEnvKeySuffix(key)}`);
  throw new Error(
    `Faltan variables de Firebase en frontend/.env.local: ${missingVars.join(', ')}`,
  );
}

const firebaseConfig = {
  apiKey: firebaseEnv.apiKey,
  authDomain: firebaseEnv.authDomain,
  projectId: firebaseEnv.projectId,
  storageBucket: firebaseEnv.storageBucket,
  messagingSenderId: firebaseEnv.messagingSenderId,
  appId: firebaseEnv.appId,
  ...(firebaseEnv.measurementId ? { measurementId: firebaseEnv.measurementId } : {}),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error al iniciar sesion:', error);
    throw new Error(getFirebaseAuthErrorMessage(error));
  }
};

export const loginWithEmailPassword = async ({ email, password }) => {
  try {
    const result = await signInWithEmailAndPassword(auth, String(email || '').trim(), password);
    return result.user;
  } catch (error) {
    console.error('Error al iniciar sesion con email:', error);
    throw new Error(getFirebaseAuthErrorMessage(error));
  }
};

export const registerWithEmailPassword = async ({ email, password, displayName = '' }) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, String(email || '').trim(), password);

    if (displayName.trim()) {
      await updateProfile(result.user, { displayName: displayName.trim() });
    }

    return result.user;
  } catch (error) {
    console.error('Error al crear cuenta con email:', error);
    throw new Error(getFirebaseAuthErrorMessage(error));
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error al cerrar sesion:', error);
  }
};

export const updateFirebaseUserProfile = async ({ displayName, photoURL } = {}) => {
  if (!auth.currentUser) {
    return;
  }

  await updateProfile(auth.currentUser, {
    ...(displayName !== undefined ? { displayName } : {}),
    ...(photoURL !== undefined ? { photoURL } : {}),
  });
};

export const sendPasswordResetLink = async (email) => {
  if (!email) {
    throw new Error('No hay un email disponible para recuperar la contrasena.');
  }

  await sendPasswordResetEmail(auth, email);
};

function getFirebaseAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'Ese correo ya esta registrado.';
    case 'auth/invalid-email':
      return 'El correo no es valido.';
    case 'auth/weak-password':
      return 'La contrasena debe tener al menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Correo o contrasena incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Prueba de nuevo en unos minutos.';
    case 'auth/operation-not-allowed':
      return 'El acceso por email no esta habilitado en Firebase.';
    case 'auth/popup-closed-by-user':
      return 'popup-closed-by-user';
    default:
      return error?.message || 'No se pudo completar la autenticacion.';
  }
}

function toEnvKeySuffix(value) {
  return value.replace(/[A-Z]/g, (match) => `_${match}`).toUpperCase();
}
