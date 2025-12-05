import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { AppState } from "../types";

// ============================================================================
// CONFIGURACIÓN DE FIREBASE (PROYECTO: alquileres-familia)
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCrpTn-fmB42jYKLgF-rBF7dvijDrVajC0",
  authDomain: "alquileres-familia.firebaseapp.com",
  projectId: "alquileres-familia",
  storageBucket: "alquileres-familia.firebasestorage.app",
  messagingSenderId: "645376629812",
  appId: "1:645376629812:web:1415d8843ff89253fb7e61",
  measurementId: "G-CX8TWY03W0"
};

// ============================================================================

// Check if config is set properly (basic check)
const isConfigured = firebaseConfig.apiKey !== "TU_API_KEY_AQUI";

let db: any;

if (isConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase inicializado correctamente con proyecto:", firebaseConfig.projectId);
  } catch (error) {
    console.error("Error inicializando Firebase:", error);
  }
} else {
  console.warn("Firebase no está configurado. La app usará modo local (sin sincronización).");
}

const DOC_ID = "estado_familiar_compartido";
const COLLECTION_NAME = "data_alquileres";

export const subscribeToData = (callback: (data: AppState) => void) => {
  if (!db) return () => {};

  console.log("Suscribiéndose a cambios en tiempo real...");
  // Listen to the document in real-time
  const unsub = onSnapshot(doc(db, COLLECTION_NAME, DOC_ID), (docSnapshot) => {
    if (docSnapshot.exists()) {
      console.log("Datos recibidos de la nube");
      callback(docSnapshot.data() as AppState);
    } else {
      console.log("No existe el documento en la nube, esperando primera escritura...");
    }
  }, (error) => {
    console.error("Error escuchando cambios de Firebase:", error);
    // Posibles causas: Reglas de seguridad, Modo Offline, o Proyecto eliminado.
  });

  return unsub;
};

export const saveDataToCloud = async (state: AppState) => {
  if (!db) {
    console.warn("No se puede guardar en la nube: Falta configuración en services/firebase.ts");
    return;
  }
  try {
    // console.log("Guardando cambios en la nube...");
    await setDoc(doc(db, COLLECTION_NAME, DOC_ID), state);
  } catch (e) {
    console.error("Error guardando en Firebase:", e);
    // Opcional: Avisar al usuario si falla constantemente
    // alert("Error de conexión al guardar en la nube. Tus datos están seguros localmente hasta que vuelva la conexión.");
  }
};

export const isFirebaseReady = () => isConfigured;
