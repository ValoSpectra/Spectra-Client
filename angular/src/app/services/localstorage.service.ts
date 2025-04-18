import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LocalstorageService {
  constructor() {}

  public setItem(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage", error);
    }
  }

  public getItem<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return null;
    }
  }

  public removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage", error);
    }
  }

  public clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage", error);
    }
  }
}
