import { readFileSync, writeFileSync } from "node:fs";

export function loadFromFile<T>(fileName: string): T[] {
  const rawData = readFileSync(`../data/${fileName}.json`, { encoding: "utf8" });
  const data = JSON.parse(rawData);
  return data;
}

export function saveToFile(data: any[], fileName: string) {
  writeFileSync(`../data/${fileName}.json`, JSON.stringify(data));
  return true;
}
