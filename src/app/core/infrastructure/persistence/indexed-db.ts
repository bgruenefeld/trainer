/** Eine Verbindung, versioniertes Schema. Schreibvorgänge lösen erst nach Commit auf. */
export class TrainerDatabase {
  private connection?: Promise<IDBDatabase>;
  constructor(private readonly name = 'retriever-trainer-v1') {}
  open(): Promise<IDBDatabase> {
    return (this.connection ??= new Promise((resolve, reject) => {
      let blocked = false;
      const request = indexedDB.open(this.name, 2);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('dogs')) db.createObjectStore('dogs', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('sessions'))
          db.createObjectStore('sessions', { keyPath: 'id' }).createIndex('dogId', 'dogId');
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
        for (const name of [
          'skillAssessments',
          'systemSessions',
          'trainingProfiles',
          'goals',
          'roadmaps',
        ]) {
          if (!db.objectStoreNames.contains(name))
            db.createObjectStore(name, { keyPath: 'id' }).createIndex('dogSystem', [
              'dogId',
              'systemId',
            ]);
        }
      };
      request.onsuccess = () => {
        if (blocked) {
          request.result.close();
          return;
        }
        request.result.onversionchange = () => {
          request.result.close();
          this.connection = undefined;
        };
        resolve(request.result);
      };
      request.onerror = () => {
        this.connection = undefined;
        reject(request.error);
      };
      request.onblocked = () => {
        blocked = true;
        this.connection = undefined;
        reject(new Error('Bitte andere App-Tabs schließen und erneut versuchen.'));
      };
    }));
  }
  async read<T>(store: string, query: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const request = query(tx.objectStore(store));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error ?? new Error('Lesen abgebrochen.'));
      tx.onerror = () => reject(tx.error);
    });
  }
  async write(store: string, value: unknown, mode: 'put' | 'add' = 'put'): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store)[mode](value);
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error ?? new Error('Speichern abgebrochen.'));
      tx.onerror = () => reject(tx.error);
    });
  }
  async close(): Promise<void> {
    (await this.connection)?.close();
    this.connection = undefined;
  }
}
