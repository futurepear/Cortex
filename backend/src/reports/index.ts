// index.ts
import fs from "fs/promises";
import path from "path";

const STORE_DIR = path.join(process.cwd(), "backend", "store");

export async function writeReport(report: string) {
  await fs.mkdir(STORE_DIR, { recursive: true });

  const fileName = `${Date.now()}.txt`;
  const filePath = path.join(STORE_DIR, fileName);

  await fs.writeFile(filePath, report, "utf8");

  return filePath;
}

export async function getTopKReportsByDate(k: number) {
  await fs.mkdir(STORE_DIR, { recursive: true });

  const files = await fs.readdir(STORE_DIR);

  const reports = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(STORE_DIR, file);
      const stat = await fs.stat(filePath);

      return {
        file,
        path: filePath,
        createdAt: stat.birthtime,
        modifiedAt: stat.mtime,
        time: Math.max(stat.birthtimeMs, stat.mtimeMs),
        content: await fs.readFile(filePath, "utf8"),
      };
    })
  );

  return reports
    .sort((a, b) => b.time - a.time)
    .slice(0, k);
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);
}

export async function searchReportsBM25(query: string, k: number) {
  await fs.mkdir(STORE_DIR, { recursive: true });

  const files = await fs.readdir(STORE_DIR);

  const docs = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(STORE_DIR, file);
      const content = await fs.readFile(filePath, "utf8");
      const tokens = tokenize(content);

      return {
        file,
        path: filePath,
        content,
        tokens,
        length: tokens.length,
      };
    })
  );

  if (docs.length === 0) return [];

  const queryTerms = tokenize(query);
  const avgDocLength =
    docs.reduce((sum, doc) => sum + doc.length, 0) / docs.length;

  const k1 = 1.5;
  const b = 0.75;

  const scored = docs.map((doc) => {
    let score = 0;

    for (const term of queryTerms) {
      const termFreq = doc.tokens.filter((t) => t === term).length;
      if (termFreq === 0) continue;

      const docFreq = docs.filter((d) => d.tokens.includes(term)).length;
      const idf = Math.log(1 + (docs.length - docFreq + 0.5) / (docFreq + 0.5));

      score +=
        idf *
        ((termFreq * (k1 + 1)) /
          (termFreq + k1 * (1 - b + b * (doc.length / avgDocLength))));
    }

    return {
      file: doc.file,
      path: doc.path,
      score,
      content: doc.content,
    };
  });

  return scored
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}