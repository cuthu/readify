'use server';

/**
 * @fileOverview Converts text and PDF documents into high-quality audio with a choice of different voices.
 *
 * - audioConversion - A function that handles the audio conversion process.
 * - AudioConversionInput - The input type for the audioConversion function.
 * - AudioConversionOutput - The return type for the audioConversion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const AudioConversionInputSchema = z.object({
  text: z.string().describe('The text to convert to audio.'),
  voiceName: z.string().optional().describe('The name of the voice to use (e.g., from OpenAI or Amazon).'),
});

export type AudioConversionInput = z.infer<typeof AudioConversionInputSchema>;

const AudioConversionOutputSchema = z.object({
  audioDataUri: z.string().describe('The audio data in WAV format as a data URI.'),
});

export type AudioConversionOutput = z.infer<typeof AudioConversionOutputSchema>;

export async function audioConversion(input: AudioConversionInput): Promise<AudioConversionOutput> {
  return audioConversionFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const audioConversionFlow = ai.defineFlow(
  {
    name: 'audioConversionFlow',
    inputSchema: AudioConversionInputSchema,
    outputSchema: AudioConversionOutputSchema,
  },
  async input => {
    // This flow is now structured to easily accommodate different voice providers.
    // The actual model call can be switched based on the `input.voiceName`.
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // A default voice is used if none is provided.
            prebuiltVoiceConfig: {voiceName: input.voiceName || 'Algenib'},
          },
        },
      },
      prompt: input.text,
    });

    if (!media) {
      throw new Error('No media returned from audio generation.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const audioDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {audioDataUri};
  }
);
