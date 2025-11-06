import React from 'react';
import { TranscriptEntry, Speaker } from '../types';

interface TranscriptProps {
  entries: TranscriptEntry[];
}

const SpeakerAvatar: React.FC<{ speaker: Speaker }> = ({ speaker }) => {
  const styles = speaker === 'user' 
    ? "bg-blue-500 text-white" 
    : "bg-purple-500 text-white";
  const label = speaker === 'user' ? 'Tú' : 'M';
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${styles}`}>
      {label}
    </div>
  );
};

const TranscriptMessage: React.FC<{ entry: TranscriptEntry }> = ({ entry }) => {
  const isUser = entry.speaker === 'user';
  const alignment = isUser ? "justify-end" : "justify-start";
  const messageBg = isUser ? "bg-blue-600" : "bg-gray-700";
  const order = isUser ? "order-2" : "order-1";

  return (
    <div className={`flex items-start gap-4 w-full ${alignment}`}>
      {!isUser && <SpeakerAvatar speaker={entry.speaker} />}
      <div className={`max-w-prose p-4 rounded-xl ${messageBg} ${order}`}>
        {entry.imageUrl && (
          <img 
            src={entry.imageUrl} 
            className="rounded-lg mb-2 max-w-xs max-h-64" 
            alt="User upload" 
          />
        )}
        {entry.isPending ? (
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="h-2 w-2 bg-white rounded-full animate-bounce"></span>
          </div>
        ) : (
          <p className="text-white whitespace-pre-wrap">{entry.text}</p>
        )}
      </div>
      {isUser && <SpeakerAvatar speaker={entry.speaker} />}
    </div>
  );
};

const Transcript: React.FC<TranscriptProps> = ({ entries }) => {
  const transcriptEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);
  
  return (
    <div className="flex-grow w-full max-w-4xl mx-auto p-4 space-y-6 overflow-y-auto">
        {entries.length === 0 && (
            <div className="text-center flex flex-col items-center justify-center h-full">
                <div className="bg-purple-500 rounded-full w-24 h-24 flex items-center justify-center mb-6 text-5xl shadow-lg">
                👵
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                Mamucha la Matemática
                </h1>
                <p className="text-gray-300 max-w-md">
                ¡Hola, mijo/mija! Sube una foto de tu problema o escríbeme tu duda de matemáticas de 2.º de Bachillerato.
                </p>
            </div>
        )}
      {entries.map((entry, index) => (
        <TranscriptMessage key={index} entry={entry} />
      ))}
      <div ref={transcriptEndRef} />
    </div>
  );
};

export default Transcript;