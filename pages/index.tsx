import { useState, useRef } from 'react';
import axios from 'axios';
import ProgressModal from '../components/ProgressModal';

const kyoko = "https://kyoko-np.net/index.xml"

export default function Home() {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const stopAudioRef = useRef<() => void>();
  const resumeAudioRef = useRef<() => void>();

  const fetchRss = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/rss', { params: { url: kyoko } });
      setArticles(response.data.items);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  const fetchArticle = async (article: any) => {
    try {
      setIsModalOpen(true);
      const response = await axios.get('/api/kyoko', {
        params: { url: article.link }
      })
      const data = [
        ...response.data.content.split(' ')
      ];
      // スマートではないが妥協する。
      const audios = []
      const palarell = 5
      for (let i = 0; i < palarell; i++) {
        if (data[i])
          audios.push(fetchAudioData(data[i]).then(getAudio))
      }
      for (let i = 0; i < data.length; i++) {
        setProgress(i / data.length * 100);
        if (i + palarell < data.length) {
          audios[i + palarell] = fetchAudioData(data[i + palarell]).then(getAudio)
        }
        const audio = await audios[i]
        if (audio == undefined) {
          continue
        }
        // stop関数を保存
        stopAudioRef.current = () => {
          audio.pause();
        };
        resumeAudioRef.current = () => {
          audio.play();
        }
        // 再生開始
        await audio.play();
        // 終了時に解決される Promise を作成
        const playPromise = new Promise<void>((resolve) => {
          if (audio == undefined) {
            resolve();
          }
          audio.onended = () => {
            resolve();
          };
        });
        // 再生終了を待つ
        await playPromise;
        audios[i] = undefined;
      }
      setProgress(100);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchAudioData = async (text: string) => {
    if (!text) {
      return undefined;
    }
    try {
      const response = await axios.post('/api/audio_query', {
        text
      });
      return response.data
    } catch (error) {
      console.error(text + "" + error);
    }
  }

  const getAudio = async (text: string) => {
    if (!text || text === "{text: \"\"}")
      return undefined;
    try {
      const response = await axios.post('/api/synthesize', {
        text
      }, {
        responseType: 'blob',
      });

      const audioBlob = new Blob([response.data], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      return new Audio(audioUrl);
    } catch (error) {
      console.error(error);
    }
  }

  const onStopButtonClick = () => {
    if (stopAudioRef.current) {
      stopAudioRef.current();
    }
  };

  const onResumeButtonClick = () => {
    if (resumeAudioRef.current) {
      resumeAudioRef.current();
    }
  };

  return (
    <div>
      <h1>News Podcast</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter a topic"
      />
      <button onClick={fetchRss} disabled={loading}>
        Fetch News
      </button>
      {loading && <p>Loading...</p>}
      <ProgressModal isOpen={isModalOpen} progress={progress} stopBtnFn={onStopButtonClick} startBtnFn={onResumeButtonClick}/>
      {articles.length !== 0 && <button onClick={async () => {
        for (let i = 0; i < articles.length; i++) {
          await fetchArticle(articles[i]);
        }
      }}>PodCast ALL</button>}
      <ul>
        {articles.map((article, index) => (
          <li key={index}>
            <h2>{article["title"]}</h2>
            <p>{article["contentSnipet"]}</p>
            <button onClick={() => fetchArticle(article)}>Play Audio</button>
            <a href={article["link"]} target="_blank" rel="noopener noreferrer">
              Read More
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
