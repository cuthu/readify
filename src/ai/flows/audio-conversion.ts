
'use server';

/**
 * @fileOverview Converts text into high-quality audio using OpenAI and Amazon Polly APIs.
 *
 * - audioConversion - A function that handles the audio conversion process.
 * - AudioConversionInput - The input type for the audioConversion function.
 * - AudioConversionOutput - The return type for the audioConversion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import OpenAI from 'openai';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

// Define the available voices, matching the frontend implementation
const voices = {
  "Amazon": ["ivy", "joanna", "kendra", "kimberly", "salli", "joey", "justin", "matthew"],
  "OpenAI": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
};

// Initialize API clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pollyClient = new PollyClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});


const AudioConversionInputSchema = z.object({
  text: z.string().describe('The text to convert to audio.'),
  voiceName: z.string().optional().describe('The name of the voice to use (e.g., "alloy" for OpenAI, "ivy" for Amazon).'),
});

export type AudioConversionInput = z.infer<typeof AudioConversionInputSchema>;

const AudioConversionOutputSchema = z.object({
  audioDataUri: z.string().describe('The audio data in MP3 format as a data URI.'),
});

export type AudioConversionOutput = z.infer<typeof AudioConversionOutputSchema>;

export async function audioConversion(input: AudioConversionInput): Promise<AudioConversionOutput> {
  return audioConversionFlow(input);
}


// Helper function to convert a stream to a buffer
async function streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: any) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}


const audioConversionFlow = ai.defineFlow(
  {
    name: 'audioConversionFlow',
    inputSchema: AudioConversionInputSchema,
    outputSchema: AudioConversionOutputSchema,
  },
  async input => {
    const voice = input.voiceName || 'alloy'; // Default to an OpenAI voice
    let audioBuffer: Buffer;
    let audioMimeType = 'audio/mpeg'; // Both OpenAI and our Polly config will use MP3

    if (voices.OpenAI.includes(voice)) {
        // --- OpenAI Text-to-Speech ---
        const response = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice as any,
            input: input.text,
            response_format: "mp3"
        });
        audioBuffer = Buffer.from(await response.arrayBuffer());

    } else if (voices.Amazon.includes(voice)) {
        // --- Amazon Polly Text-to-Speech ---
        const command = new SynthesizeSpeechCommand({
            Text: input.text,
            OutputFormat: 'mp3',
            VoiceId: voice.charAt(0).toUpperCase() + voice.slice(1), // Polly voice IDs are capitalized (e.g., "Ivy")
        });
        const response = await pollyClient.send(command);
        if (!response.AudioStream) {
            throw new Error('No audio stream returned from Amazon Polly.');
        }
        audioBuffer = await streamToBuffer(response.AudioStream);

    } else {
        throw new Error(`Unsupported voice: ${voice}. Please select a valid voice from OpenAI or Amazon.`);
    }

    const audioDataUri = `data:${audioMimeType};base64,${audioBuffer.toString('base64')}`;

    return { audioDataUri };
  }
);
