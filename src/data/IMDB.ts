export class InMemoryDB {
  private store: { [key: string]: any };

  constructor() {
    this.store = {};
  }

  get(key: string): any {
    return this.store[key] || null;
  }

  save(value: any): void {
    this.store[value.id] = value;
  }

  delete(key: string): void {
    delete this.store[key];
  }

  exists(key: string): boolean {
    return key in this.store;
  }

  getAll(): { [key: string]: any } {
    return Object.values(this.store);
  }

  clear(): void {
    this.store = {};
  }
}
