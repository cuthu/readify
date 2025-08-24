'use server';
/**
 * @fileOverview A video generation AI agent.
 *
 * - generateVideo - A function that handles the video generation process.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import * as fs from 'fs';
import { Readable } from 'stream';
import type { MediaPart } from 'genkit';

async function downloadVideo(video: MediaPart, path: string) {
  const fetch = (await import('node-fetch')).default;
  // Add API key before fetching the video.
  const videoDownloadResponse = await fetch(
    `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
  );
  if (
    !videoDownloadResponse ||
    videoDownloadResponse.status !== 200 ||
    !videoDownloadResponse.body
  ) {
    throw new Error('Failed to fetch video');
  }

  Readable.from(videoDownloadResponse.body).pipe(fs.createWriteStream(path));
}

const GenerateVideoInputSchema = z.object({
  prompt: z.string().describe('The text prompt for video generation.'),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
  videoDataUri: z.string().describe('The video data in MP4 format as a data URI.'),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;


export const generateVideo = ai.defineFlow(
  {
    name: 'generateVideo',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async ({ prompt }) => {
    let { operation } = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt,
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes. Note that this may take some time, maybe even up to a minute. Design the UI accordingly.
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      // Sleep for 5 seconds before checking again.
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }

    const video = operation.output?.message?.content.find((p) => !!p.media);
    if (!video) {
      throw new Error('Failed to find the generated video');
    }
    const path = 'output.mp4';
    await downloadVideo(video, path);
    const videoBuffer = fs.readFileSync(path);
    return {
        videoDataUri: 'data:video/mp4;base64,' + videoBuffer.toString('base64'),
    };
  }
);
