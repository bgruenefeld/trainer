import { TrainerDatabase } from './indexed-db';
import { DEMO_DOG } from './demo-dog';
/** Kein fachlicher Status-Seed; bestehende Daten werden unverändert übernommen. */
export async function initializeMitchell(db: TrainerDatabase): Promise<void> {
  const connection = await db.open();
  return new Promise((resolve, reject) => {
    const tx = connection.transaction(['dogs', 'meta'], 'readwrite');
    const marker = tx.objectStore('meta').get('mitchell-initialized');
    marker.onsuccess = () => {
      if (marker.result) return;
      const count = tx.objectStore('dogs').count();
      count.onsuccess = () => {
        if (!count.result) tx.objectStore('dogs').add(DEMO_DOG);
      };
      tx.objectStore('meta').put(true, 'mitchell-initialized');
    };
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error('Initialisierung abgebrochen.'));
    tx.onerror = () => reject(tx.error);
  });
}
