import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  try {
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        apiKey: process.env.NEWS_API_KEY,
        country: "jp",
      },
    });

    console.log(response.data)

    const articles = response.data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
    }));

    res.status(200).json({ articles });
  } catch (error) {
    res.status(500).json({ error: "Error fetching news" });
  }
}
