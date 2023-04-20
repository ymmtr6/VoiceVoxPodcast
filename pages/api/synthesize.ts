import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text parameter is required" });
  }

  try {
    const speakerId = process.env.VOICEVOX_SPEAKER_ID ?? 14;

    const audioResponse = await axios.post(
      `${process.env.VOICEVOX_API_URL}/synthesis?speaker=14`,
      text,
      {
        responseType: "arraybuffer",
      }
    );

    res.setHeader("Content-Type", "audio/wav");
    res.status(200).send(Buffer.from(audioResponse.data));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error synthesizing audio" });
  }
}
