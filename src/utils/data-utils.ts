"use server"
import { readFileSync, writeFileSync } from "node:fs";

export async function loadFromFile<T>(fileName: string): Promise<T[]> {
  const rawData = readFileSync(`${__dirname}/src/data/${fileName}.json`, { encoding: "utf8" });
  const data = JSON.parse(rawData);
  return data;
}

export async function saveToFile(data: any[], fileName: string) {
  writeFileSync(`${__dirname}/src/data/${fileName}.json`, JSON.stringify(data));
  return true;
}
