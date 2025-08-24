// This is a serverless function that will run on a server, not in the browser.
// Its job is to securely call the ElevenLabs API.

export default async function handler(request, response) {
  // We only want to handle POST requests, which is what our app sends.
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the text that our app sent in the request.
    const { text } = request.body;
    if (!text) {
      return response.status(400).json({ message: 'Text is required' });
    }

    // This is the crucial part: Get the secret API key from a secure location.
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        return response.status(500).json({ message: 'API key not configured on the server.' });
    }

    // This is the ID for a great, natural-sounding voice from ElevenLabs called "Rachel".
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; 

    // Call the real ElevenLabs API, including our secret key.
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey, // Here's where we use the secret key.
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      // If ElevenLabs gives an error, we send it back to our app to help debug.
      const errorData = await elevenLabsResponse.text();
      console.error('ElevenLabs API Error:', errorData);
      return response.status(elevenLabsResponse.status).json({ message: 'Error from ElevenLabs API' });
    }

    // If successful, we get the audio data and send it back to our app.
    response.setHeader('Content-Type', 'audio/mpeg');
    const audioStream = elevenLabsResponse.body;
    return response.status(200).send(audioStream);

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }

}
