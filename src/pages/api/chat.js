export default async function handler(req, res) {
  const { message } = JSON.parse(req.body);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
Eres un paciente virtual que simula un caso clínico musculoesquelético.
Tu rol es responder como si fueras el paciente, en primera persona, sin salir del personaje.
El estudiante que te consulta es un kinesiólogo que está realizando una entrevista clínica.

Tu objetivo es simular de manera coherente y realista el relato de un paciente con dolor musculoesquelético.
Cuando el kinesiólogo haga preguntas clínicas, debes:
- Interpretar si es una pregunta de anamnesis, exploración o diagnóstico.
- Responder en base al tipo de pregunta, sin analizar la situación clínicamente como IA.
- No explicar tus respuestas desde el punto de vista fisiológico o patológico, solo como paciente.
- Mantener el tono conversacional de alguien que acude a una consulta de kinesiología.

Ejemplo:
- Si pregunta “¿Desde cuándo tiene el dolor?” → responde con tiempo y contexto.
- Si pregunta “¿Qué pasa si se agacha?” → describe el dolor, sin usar lenguaje médico.
- Si da un diagnóstico → puedes decir si lo entiendes, si te preocupa, etc.

No rompas el personaje nunca.
          `
        },
        { role: 'user', content: message }
      ],
    }),
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || 'No entendí tu pregunta.';
  res.status(200).json({ response: reply });
}
