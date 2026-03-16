import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

// Skip local checks for models
env.allowLocalModels = false;
env.useBrowserCache = true;

let recognizer = null;

self.onmessage = async (event) => {
    const { type, audio } = event.data;

    if (type === 'load') {
        try {
            self.postMessage({ status: 'loading', message: 'Initializing Whisper...' });
            recognizer = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
            self.postMessage({ status: 'ready' });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
    } else if (type === 'transcribe') {
        if (!recognizer) {
            self.postMessage({ status: 'error', error: 'Model not loaded' });
            return;
        }

        try {
            self.postMessage({ status: 'processing' });
            const output = await recognizer(audio, {
                chunk_length_s: 30,
                stride_length_s: 5,
                return_timestamps: true,
            });
            self.postMessage({ status: 'complete', output });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
    }
};
