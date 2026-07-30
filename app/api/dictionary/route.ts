import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Dictionary lookup endpoint, powering the in-article word popover
 * (components/article/DictionaryPopover.tsx).
 *
 * Default provider: the free Dictionary API (https://dictionaryapi.dev)
 * — no API key required, so this feature works out of the box. It
 * covers a handful of languages well beyond English (see
 * SUPPORTED_LANGUAGES below); coverage for the rest is thinner.
 *
 * Optional upgrade: set WORDS_API_KEY (see .env.example) to a
 * WordsAPI key (https://rapidapi.com/dpventures/api/wordsapi) for a
 * richer, more consistent English-only dataset — if present, it's
 * preferred for English lookups. Swapping in a different provider
 * (e.g. Merriam-Webster) only requires editing fetchFromWordsApi/
 * fetchFromFreeDictionary below; the response shape returned to the
 * client stays the same either way.
 *
 * Supported languages for the free-tier lookup: English, Spanish,
 * French, and Hindi have solid coverage; Japanese and German are
 * thinner. The language selector in DictionaryPopover.tsx lists these
 * directly (kept in that client component rather than re-exported
 * from here, since a route file may only export HTTP method handlers).
 */

interface NormalizedEntry {
  word: string;
  phonetic: string | null;
  audioUrl: string | null;
  meanings: {
    partOfSpeech: string;
    definitions: string[];
    synonyms: string[];
    example: string | null;
  }[];
}

async function fetchFromFreeDictionary(
  word: string,
  lang: string
): Promise<NormalizedEntry | null> {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/${encodeURIComponent(lang)}/${encodeURIComponent(word)}`,
    { next: { revalidate: 60 * 60 * 24 } }
  );
  if (!response.ok) return null;

  const data = await response.json();
  const entry = Array.isArray(data) ? data[0] : null;
  if (!entry) return null;

  const phoneticEntry = (entry.phonetics ?? []).find((p: { text?: string }) => p.text);
  const audioEntry = (entry.phonetics ?? []).find((p: { audio?: string }) => p.audio);

  const meanings = (entry.meanings ?? []).map(
    (meaning: {
      partOfSpeech?: string;
      definitions?: { definition?: string; synonyms?: string[]; example?: string }[];
      synonyms?: string[];
    }) => ({
      partOfSpeech: meaning.partOfSpeech ?? "",
      definitions: (meaning.definitions ?? [])
        .map((d) => d.definition)
        .filter((d): d is string => Boolean(d))
        .slice(0, 3),
      synonyms: [
        ...(meaning.synonyms ?? []),
        ...(meaning.definitions ?? []).flatMap((d) => d.synonyms ?? []),
      ].slice(0, 6),
      example: meaning.definitions?.find((d) => d.example)?.example ?? null,
    })
  );

  return {
    word: entry.word ?? word,
    phonetic: entry.phonetic ?? phoneticEntry?.text ?? null,
    audioUrl: audioEntry?.audio || null,
    meanings,
  };
}

async function fetchFromWordsApi(word: string): Promise<NormalizedEntry | null> {
  const apiKey = process.env.WORDS_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://wordsapiv1.p.rapidapi.com/words/${encodeURIComponent(word)}`,
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
      },
      next: { revalidate: 60 * 60 * 24 },
    }
  );
  if (!response.ok) return null;

  const data = await response.json();
  const results: {
    definition?: string;
    partOfSpeech?: string;
    synonyms?: string[];
    examples?: string[];
  }[] = data.results ?? [];

  const byPartOfSpeech = new Map<string, (typeof results)[number][]>();
  for (const result of results) {
    const pos = result.partOfSpeech ?? "other";
    if (!byPartOfSpeech.has(pos)) byPartOfSpeech.set(pos, []);
    byPartOfSpeech.get(pos)!.push(result);
  }

  const meanings = Array.from(byPartOfSpeech.entries()).map(([partOfSpeech, entries]) => ({
    partOfSpeech,
    definitions: entries
      .map((e) => e.definition)
      .filter((d): d is string => Boolean(d))
      .slice(0, 3),
    synonyms: entries.flatMap((e) => e.synonyms ?? []).slice(0, 6),
    example: entries.find((e) => e.examples?.length)?.examples?.[0] ?? null,
  }));

  return {
    word: data.word ?? word,
    phonetic: data.pronunciation?.all ?? null,
    audioUrl: null,
    meanings,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word")?.trim().toLowerCase();
  const lang = searchParams.get("lang")?.trim().toLowerCase() || "en";

  if (!word) {
    return NextResponse.json({ error: "Missing word." }, { status: 400 });
  }
  if (!/^[a-zA-Z'-]{1,40}$/.test(word)) {
    return NextResponse.json({ error: "Select a single word." }, { status: 400 });
  }

  try {
    const entry =
      lang === "en"
        ? (await fetchFromWordsApi(word)) ?? (await fetchFromFreeDictionary(word, lang))
        : await fetchFromFreeDictionary(word, lang);

    if (!entry) {
      return NextResponse.json(
        { error: `No definition found for "${word}".` },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Dictionary lookup error:", error);
    return NextResponse.json(
      { error: "Something went wrong looking that up." },
      { status: 500 }
    );
  }
}
