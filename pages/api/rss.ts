import type { NextApiRequest, NextApiResponse } from "next";
import Parser from "rss-parser";

const parser = new Parser();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const feedUrl = req.query.url as string;

  if (!feedUrl) {
    res.status(400).json({ error: "URL parameter is missing" });
    return;
  }

  try {
    const feed = await parser.parseURL(feedUrl);
    res.status(200).json(feed);
  } catch (error: any) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error fetching RSS feed" });
  }
}
