// On‑device OCR service.
// Attempts to use `react-native-text-recognition` (native Tesseract based) with some light preprocessing
// and multiple defensive fallbacks so the app never crashes inside Expo Go / dev client.
// Optimization targets:
//  - Normalize resolution (upscale small images) to help recognition
//  - Preserve line separation for better flashcard parsing
//  - Gracefully degrade when the native module is absent (managed workflow / Expo Go)
//
// To enable real OCR:
// 1. Install dependency (already done): react-native-text-recognition
// 2. Prebuild: npx expo prebuild
// 3. Rebuild dev client: npx expo run:ios (or run:android)
// 4. Launch the custom dev client instead of Expo Go.
// Without steps 2-4 you'll see placeholder output or per-image failure fallbacks.
import { NativeModules, Platform } from 'react-native';
export interface OCRResult {
  text: string;
  pages: { index: number; text: string }[];
  warnings?: string[];
  engine?: 'placeholder' | 'text-recognition-native';
}

class OCRServiceImpl {
  async extractText(imageUris: string[]): Promise<OCRResult> {
    // We isolate each require so a failure never triggers a red screen; instead we fallback.
    let recognizer: ((path: string) => Promise<any>) | null = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('react-native-text-recognition');
        const candidate = (mod && mod.default) || mod;
        recognizer = candidate && typeof candidate.recognize === 'function' ? candidate.recognize : null;
        // Debug info
        // eslint-disable-next-line no-console
        console.log('[OCR] Module loaded:', Object.keys(candidate || {}));
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.log('[OCR] require failed:', err?.message || err);
      }

      if (!recognizer || !NativeModules?.TextRecognition) {
        return this.placeholder(imageUris, `Placeholder OCR used (native module not loaded). Steps:\n1. npx expo prebuild\n2. (cd ios && pod install) or npx pod-install\n3. npx expo run:ios (launch built app, not Expo Go)\nPlatform=${Platform.OS}`);
    }

    // Try to load image manipulator; optional.
    let manipulateAsync: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      manipulateAsync = require('expo-image-manipulator').manipulateAsync;
    } catch {
      // optional dependency; continue without preprocessing
    }

    const pages: { index: number; text: string }[] = [];
    for (let i = 0; i < imageUris.length; i++) {
      const originalUri = imageUris[i];
      try {
        const attempts: string[] = [];
        const errors: string[] = [];
        // 1. Original path as-is
        const raw1 = await this.safeRecognize(recognizer, originalUri, attempts, errors);
        let rawLines: any = raw1;
        // 2. If fails and starts with file:// try without
        if (!rawLines && originalUri.startsWith('file://')) {
          const alt = originalUri.replace('file://', '');
          rawLines = await this.safeRecognize(recognizer, alt, attempts, errors);
        }
        // 3. Preprocess and try (both with & without scheme) if still empty
        if ((!rawLines || (Array.isArray(rawLines) && rawLines.length === 0)) && manipulateAsync) {
          const preprocessed = await this.preprocessImage(originalUri, manipulateAsync);
          rawLines = await this.safeRecognize(recognizer, preprocessed, attempts, errors);
          if ((!rawLines || (Array.isArray(rawLines) && rawLines.length === 0)) && preprocessed.startsWith('file://')) {
            const alt2 = preprocessed.replace('file://', '');
            rawLines = await this.safeRecognize(recognizer, alt2, attempts, errors);
          }
        }
        const joined = this.normalizeLines(rawLines);
        if (!joined) {
          pages.push({ index: i, text: `[[ Empty OCR result after attempts. Attempts=${attempts.join(' | ')} Errors=${errors.join(' || ')} ]]` });
        } else {
          pages.push({ index: i, text: joined });
        }
      } catch (err: any) {
        console.warn('[OCR] single image failed', err);
        pages.push({ index: i, text: `[[ OCR failure. Error=${err?.message || err} ]]` });
      }
    }
    return {
      text: pages.map(p => p.text).join('\n\n'),
      pages,
      engine: 'text-recognition-native'
    };
  }

  private placeholder(imageUris: string[], warning: string): OCRResult {
    const pages = imageUris.map((u, i) => ({ index: i, text: `[[ Placeholder OCR page ${i + 1} from ${u.split('/').pop()} ]]` }));
    return {
      text: pages.map(p => p.text).join('\n\n'),
      pages,
      warnings: [warning],
      engine: 'placeholder'
    };
  }

  private normalizeLines(raw: unknown): string {
    if (!raw) return '';
    let lines: string[] = [];
    if (Array.isArray(raw)) {
      lines = raw.filter(l => typeof l === 'string').map(l => (l as string).trim()).filter(Boolean);
    } else if (typeof raw === 'string') {
      lines = raw.split(/\n+/).map(l => l.trim()).filter(Boolean);
    }
    return lines.join('\n');
  }

  private async tryBothPaths(recognizeFn: (path: string) => Promise<any>, uri: string): Promise<any> {
    // Some native libs want a path without file:// scheme on iOS.
    try {
      return await recognizeFn(uri);
    } catch (err) {
      if (uri.startsWith('file://')) {
        const alt = uri.replace('file://', '');
        return await recognizeFn(alt);
      }
      throw err;
    }
  }

  private async safeRecognize(
    recognizeFn: (path: string) => Promise<any>,
    path: string,
    attempts: string[],
    errors: string[]
  ): Promise<any | null> {
    attempts.push(path);
    try {
      const res = await recognizeFn(path);
      if (res && Array.isArray(res) && res.length) {
        console.log('[OCR] success path=', path, 'lines=', res.length);
      } else {
        console.log('[OCR] empty result path=', path);
      }
      return res;
    } catch (e: any) {
      const msg = e?.message || String(e);
      errors.push(`${path} -> ${msg}`);
      console.log('[OCR] attempt failed path=', path, 'err=', msg);
      return null;
    }
  }

  private async preprocessImage(uri: string, manipulateAsync: any): Promise<string> {
    try {
      // Basic heuristic: upscale narrow images to at least 1200px width for clearer glyphs.
      // We don't know intrinsic size without an extra probe; attempt a conservative resize anyway.
      const targetWidth = 1200; // Good balance for handwriting
      // Manipulator will preserve aspect ratio if only width specified.
      const result = await manipulateAsync(uri, [{ resize: { width: targetWidth } }], { compress: 0.9 });
      return result.uri || uri;
    } catch {
      return uri; // If preprocessing fails just return original.
    }
  }
}

export default new OCRServiceImpl();

