import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import cheerio from "cheerio";

class ChainedProcessor {
  value: string;

  constructor(input: string) {
    this.value = input;
  }

  apply(fn: Function) {
    this.value = fn(this.value);
    return this;
  }

  result() {
    return this.value;
  }
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ");
}

function toHalfWidthAlphabet(str: string) {
  return str.replace(/Ａ-Ｚａ-ｚ/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 65248);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const articleUrl = req.query.url as string;

  try {
    const response = await axios.get(articleUrl);
    const $ = cheerio.load(response.data);

    // 不要な情報を削除
    $('div.advert').remove()
    $('style').remove()
    $('ins').remove()
    $('script').remove()
    $('.app').remove()

    const chain = new ChainedProcessor($('article').text().trim())
    const content = chain
      .apply(toHalfWidthAlphabet)
      .apply((str: string) => str.replaceAll("。", " "))
      // .apply((str: string) => str.replaceAll('、', ' '))
      .apply(normalizeWhitespace)
      .result();

    res.status(200).json({ content: content });
  } catch (error: any) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error fetching fictional news" });
  }
}
