import { google, docs_v1 } from "googleapis";
import { getGoogleAuth } from "../google.js";

// pull the plain text out of one body's content. paragraphs only,
function extractText(content: docs_v1.Schema$StructuralElement[] | undefined): string {
  if (!content) return "";
  let out = "";
  for (const el of content) {
    for (const e of el.paragraph?.elements ?? []) {
      if (e.textRun?.content) out += e.textRun.content;
    }
  }
  return out;
}

function walkTabs(tabs: docs_v1.Schema$Tab[] | undefined): string {
  if (!tabs) return "";
  let out = "";
  for (const tab of tabs) {
    const title = tab.tabProperties?.title;
    if (title) out += `\n\n## ${title}\n`;
    out += extractText(tab.documentTab?.body?.content);
    out += walkTabs(tab.childTabs);
  }
  return out;
}

export async function fetchGoogleDoc(docId: string): Promise<{ title: string; content: string }> {
  const auth = await getGoogleAuth();
  const docs = google.docs({ version: "v1", auth: auth as any });
  // includeTabsContent=true is required to get nested tab content
  const { data } = await docs.documents.get({ documentId: docId, includeTabsContent: true });

  const title = data.title ?? "(untitled)";
  // tabbed docs vs legacy single-tab docs
  const content = data.tabs?.length
    ? walkTabs(data.tabs)
    : extractText(data.body?.content);

  return { title, content };
}
