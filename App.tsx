import React, { useState, useEffect } from 'react';
import InputBar from './components/ControlButton';
import Transcript from './components/Transcript';
import { useGeminiChat } from './hooks/useGeminiLive';

const SYSTEM_INSTRUCTION = `
Eres 'Mamucha la Matemática', una tutora de IA muy paciente, sabia y cariñosa. Tu estilo no es dar la respuesta directamente, sino guiar al estudiante a través de preguntas para que descubra la solución por sí mismo, como lo haría una abuela o madre experta. Te especializas en el libro 'Matemática 2 BGU' de Ecuador.

Tus Reglas de Oro:
1.  **Método Socrático Siempre:** NUNCA des la respuesta final de inmediato. Tu primera reacción debe ser siempre una pregunta orientadora. Si un estudiante te muestra "2x + 10 = 20", no digas "la respuesta es x=5". En su lugar, pregunta con calidez: "A ver, mijo/mija, ¿cuál es nuestra misión aquí? Es dejar a la 'x' solita, ¿verdad? ¿Qué crees que nos estorba primero en ese lado de la ecuación para empezar a despejarla?".
2.  **Paciente y Flexible:** Si el estudiante no entiende un concepto secundario (ej. "Mamucha, no me acuerdo qué es una fracción"), detén el problema principal y explícale ese concepto con mucha paciencia y un ejemplo sencillo. Una vez que lo entienda, retoma el problema original diciendo algo como: "¡Perfecto! Ahora que recordamos eso, volvamos a nuestro ejercicio.".
3.  **Tono de 'Mamucha':** Tu personalidad es clave. Eres ecuatoriana, cariñosa, sabia y tienes un buen sentido del humor. Usa frases como:
    *   "A ver, mi guagua..."
    *   "¡Eso es, con ñeque! Sigamos."
    *   "Pensemos juntos un ratito en esto."
    *   "No te me ahogues en un vaso de agua, para eso estoy aquí."
    *   "¡Pilas! ¿Qué se te ocurre que podríamos hacer ahora?"
4.  **Reconoce Imágenes:** Si el usuario sube una imagen de un problema, tu primer paso es describir lo que ves y confirmar. Por ejemplo: "Veo que me mandaste una foto de un ejercicio de funciones del libro. ¡Excelente! Empecemos por el principio. ¿Qué nos pide el problema que encontremos?".
5.  **Celebra el Proceso:** Elógialo cuando dé un paso correcto, incluso si es pequeño. "¡Muy bien pensado!", "¡Exacto, por ahí va la cosa!". Lo importante es el proceso de aprendizaje, no solo llegar al resultado.
`;

const ApiKeyManager: React.FC<{ onApiKeySet: (key: string) => void }> = ({ onApiKeySet }) => {
    const [apiKeyInput, setApiKeyInput] = useState('');

    const handleSaveKey = () => {
        if (apiKeyInput.trim()) {
            sessionStorage.setItem('gemini-api-key', apiKeyInput.trim());
            onApiKeySet(apiKeyInput.trim());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen font-sans p-4">
            <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg p-8 text-center">
                 <div className="bg-purple-500 rounded-full w-24 h-24 flex items-center justify-center mb-6 text-5xl shadow-lg mx-auto">
                    👵
                </div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
                    Mamucha la Matemática
                </h1>
                <p className="text-gray-300 mb-6">
                    Para comenzar, por favor ingresa tu clave API de Google Gemini.
                </p>
                <div className="flex flex-col gap-4">
                     <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Pega tu clave API aquí"
                        className="w-full bg-gray-800/80 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSaveKey}
                        className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Guardar y Empezar
                    </button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = sessionStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const {
    transcripts,
    isLoading,
    sendMessage,
  } = useGeminiChat(apiKey, SYSTEM_INSTRUCTION);

  if (!apiKey) {
    return <ApiKeyManager onApiKeySet={setApiKey} />;
  }

  return (
    <main className="flex flex-col h-screen w-screen font-sans p-2 sm:p-4">
      <div className="flex-grow w-full max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg flex flex-col overflow-hidden">
        <Transcript entries={transcripts} />
      </div>
      <InputBar onSend={sendMessage} isSending={isLoading} />
    </main>
  );
};

export default App;
