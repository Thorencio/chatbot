import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  // Enviar mensaje
  const sendMessage = async (userInput) => {
    if (!userInput.trim()) return;

    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: userInput }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { from: 'user', text: userInput },
      { from: 'bot', text: data.response },
    ]);
    setInput('');
    setLoading(false);
  };

  const handleSend = () => sendMessage(input);

  // Generar paciente aleatorio al inicio
  useEffect(() => {
    const iniciarCaso = async () => {
      setLoading(true);

      const zonas = [
        'columna lumbar',
        'columna cervical',
        'columna dorsal',
        'cadera',
        'rodilla',
        'tobillo',
        'pie',
        'hombro',
        'codo',
        'mano'
      ];

      const zona = zonas[Math.floor(Math.random() * zonas.length)];

      const prompt = `
Genera un caso clínico de fisioterapia musculoesquelética. 
Simula a un paciente con dolor en la zona de ${zona}.
Incluye nombre, edad, sexo y ocupación del paciente.
Preséntate como el paciente, en primera persona, describiendo el motivo de consulta y el inicio del dolor. 
No salgas del personaje de paciente.
`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();
      setMessages([{ from: 'bot', text: data.response }]);
      setLoading(false);
    };

    iniciarCaso();
  }, []);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Exportar conversación como PDF
  const exportToPDF = async () => {
    const input = chatRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('conversacion_kinbot.pdf');
  };

  return (
    <main className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-2xl p-6 border border-blue-100">
        {/* Encabezado */}
        <div className="flex items-center justify-center mb-6">
          <span className="text-3xl mr-2">🦵🧠</span>
          <h1 className="text-3xl font-bold text-blue-900">KIN-Bot - Chat Clínico</h1>
        </div>

        {/* Conversación */}
        <div ref={chatRef} className="h-72 overflow-y-auto bg-gray-50 border rounded-lg p-4 mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 max-w-[90%] ${
                msg.from === 'user' ? 'ml-auto text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  msg.from === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-900'
                }`}
              >
                <strong>{msg.from === 'user' ? 'Tú' : 'KIN-Bot'}:</strong> {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <p className="italic text-gray-500 text-sm">KIN-Bot está escribiendo...</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <input
          className="w-full p-3 border border-blue-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Haz preguntas clínicas o indica tu evaluación..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <div className="flex flex-col md:flex-row gap-2">
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
            onClick={handleSend}
          >
            Enviar
          </button>
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200"
            onClick={exportToPDF}
          >
            Guardar como PDF
          </button>
        </div>
      </div>
      <p className="text-sm text-blue-800 mt-4 italic">
        💬 Interactúa como kinesiólogo en formación: entrevista, evalúa, reflexiona.
      </p>
    </main>
  );
}
