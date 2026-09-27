/** Eine Verbindung, versioniertes Schema. Schreibvorgänge lösen erst nach Commit auf. */
export class TrainerDatabase {
  private connection?: Promise<IDBDatabase>;
  constructor(private readonly name = 'retriever-trainer-v1') {}
  open(): Promise<IDBDatabase> {
    return (this.connection ??= new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore('dogs', { keyPath: 'id' });
        db.createObjectStore('sessions', { keyPath: 'id' }).createIndex('dogId', 'dogId');
        db.createObjectStore('meta');
      };
      request.onsuccess = () => {
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
  async write(store: string, value: unknown): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(value);
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
