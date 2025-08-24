// This is a serverless function with enhanced logging to debug the ElevenLabs API call.

export default async function handler(request, response) {
  console.log('--- TTS function started ---');

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text } = request.body;
    if (!text) {
      console.error('Error: No text provided in the request body.');
      return response.status(400).json({ message: 'Text is required' });
    }
    console.log(`Received text: "${text}"`);

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('FATAL ERROR: ELEVENLABS_API_KEY is not configured on the server.');
      return response.status(500).json({ message: 'API key not configured on the server.' });
    }
    console.log('API key found.');

    const voiceId = '21m00Tcm4TlvDq8ikWAM';

    console.log('Calling ElevenLabs API...');
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    console.log(`ElevenLabs response status: ${elevenLabsResponse.status}`);
    console.log(`ElevenLabs response content-type: ${elevenLabsResponse.headers.get('content-type')}`);

    if (!elevenLabsResponse.ok) {
      const errorData = await elevenLabsResponse.text();
      console.error('ElevenLabs API Error:', errorData);
      return response.status(elevenLabsResponse.status).json({ message: 'Error from ElevenLabs API' });
    }

    console.log('Successfully received audio stream from ElevenLabs. Sending to client.');
    response.setHeader('Content-Type', 'audio/mpeg');
    const audioStream = elevenLabsResponse.body;
    return response.status(200).send(audioStream);

  } catch (error) {
    console.error('Internal Server Error in catch block:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}
