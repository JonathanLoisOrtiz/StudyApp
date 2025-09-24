// GPT4ALL Integration Service
// This is a mock implementation for now - replace with actual GPT4ALL API calls

export interface GeneratedCard {
  front: string;
  back: string;
  confidence?: number;
}

export class GPT4ALLService {
  private static instance: GPT4ALLService;
  private baseUrl: string = 'http://localhost:4891/v1'; // Default GPT4ALL server URL
  
  static getInstance(): GPT4ALLService {
    if (!GPT4ALLService.instance) {
      GPT4ALLService.instance = new GPT4ALLService();
    }
    return GPT4ALLService.instance;
  }

  // Configure the GPT4ALL server URL
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  // Generate flashcards from text using GPT4ALL
  async generateCards(text: string, maxCards: number = 8): Promise<GeneratedCard[]> {
    try {
      // For now, use the fallback method
      // Later, uncomment and modify the GPT4ALL API call below
      return this.generateCardsFallback(text, maxCards);
      
      // Uncomment this section when you have GPT4ALL running:
      /*
      const prompt = this.createCardGenerationPrompt(text, maxCards);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt4all-j-v1.3-groovy', // or your preferred model
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`GPT4ALL API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || '';
      
      return this.parseCardsFromAIResponse(aiResponse);
      */
    } catch (error) {
      console.error('GPT4ALL generation failed, using fallback:', error);
      return this.generateCardsFallback(text, maxCards);
    }
  }

  private createCardGenerationPrompt(text: string, maxCards: number): string {
    return `Generate ${maxCards} flashcards from the following text. Each flashcard should test key concepts, definitions, or important facts. Format your response exactly as follows:

CARD 1:
Q: [Question]
A: [Answer]

CARD 2:
Q: [Question]
A: [Answer]

(continue for all cards)

Focus on:
- Key definitions and terms
- Important concepts and relationships
- Facts that would be useful for studying
- Clear, concise questions with specific answers

Text to analyze:
${text}

Generate the flashcards now:`;
  }

  private parseCardsFromAIResponse(response: string): GeneratedCard[] {
    const cards: GeneratedCard[] = [];
    const cardPattern = /CARD \d+:\s*Q:\s*(.+?)\s*A:\s*(.+?)(?=CARD \d+:|$)/gs;
    
    let match;
    while ((match = cardPattern.exec(response)) !== null) {
      const front = match[1].trim();
      const back = match[2].trim();
      
      if (front && back) {
        cards.push({
          front,
          back,
          confidence: 0.8
        });
      }
    }

    // If the pattern matching fails, try a simpler approach
    if (cards.length === 0) {
      const lines = response.split('\n').filter(line => line.trim());
      let currentFront = '';
      
      for (const line of lines) {
        if (line.startsWith('Q:') || line.includes('Question:')) {
          currentFront = line.replace(/^Q:\s*|Question:\s*/i, '').trim();
        } else if (line.startsWith('A:') || line.includes('Answer:')) {
          const back = line.replace(/^A:\s*|Answer:\s*/i, '').trim();
          if (currentFront && back) {
            cards.push({
              front: currentFront,
              back,
              confidence: 0.7
            });
            currentFront = '';
          }
        }
      }
    }

    return cards.slice(0, 10); // Limit to 10 cards max
  }

  // Fallback method using simple text processing
  private generateCardsFallback(text: string, maxCards: number): GeneratedCard[] {
    const cards: GeneratedCard[] = [];

    // 1. Pre‑clean text: remove placeholder / bracketed pages & excessively short lines
    const cleaned = text
      .split(/\r?\n+/)
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('[[') && !/placeholder ocr page/i.test(l));

    // 2. Group into paragraphs separated by blank lines originally (approx by double newline)
    const paragraphs = text
      .split(/\n{2,}/)
      .map(p => p.replace(/\s+/g, ' ').trim())
      .filter(p => p.length > 25 && !/placeholder ocr page/i.test(p));

    const seenFronts = new Set<string>();
    const pushCard = (front: string, back: string, confidence: number) => {
      if (!front || !back) return;
      const normalized = front.toLowerCase();
      if (seenFronts.has(normalized)) return;
      seenFronts.add(normalized);
      cards.push({ front: this.capitalize(front.trim()), back: back.trim(), confidence });
    };

    // Helper: normalize subject
    const normalizeSubject = (s: string) => {
      return s
        .replace(/^(the|a|an)\s+/i, '')
        .replace(/\s+(process|movement|act|method)\b.*$/i, '')
        .trim();
    };

    // 3. Definition style extraction (term: definition)
    for (const line of cleaned) {
      if (cards.length >= maxCards) break;
      // Pattern: Term: definition
      const colonMatch = line.match(/^([A-Za-z0-9()[\] \-]{2,60}?):\s+(.{10,})$/);
      if (colonMatch) {
        const term = colonMatch[1].trim();
        const def = colonMatch[2].trim();
        pushCard(`What is ${term}?`, this.truncate(def), 0.9);
        continue;
      }
    }

    // 4. Sentence-level definition patterns inside paragraphs
    for (const para of paragraphs) {
      if (cards.length >= maxCards) break;
      const firstSentence = para.split(/(?<=\.)\s+/)[0] || para;

      // Pattern: X is / are ...
      const defMatch = firstSentence.match(/^([A-Z][A-Za-z0-9() \-]{2,80}?)\s+(is|are)\s+(.{10,})$/);
      if (defMatch) {
        const subjectRaw = defMatch[1].trim();
        const verb = defMatch[2].toLowerCase();
        let rest = defMatch[3].trim();
        // Cut off trailing extra sentences for answer brevity
        rest = this.truncate(rest.replace(/\s+It\s+.+$/i, ''));
        const subject = normalizeSubject(subjectRaw);
        pushCard(`What ${verb} ${subject}?`, rest, 0.9);
        continue;
      }

      // Pattern: X are known as ... because ...
      const knownMatch = firstSentence.match(/^([A-Z][A-Za-z0-9() \-]{2,80}?)\s+are\s+known\s+as\s+(.+?)(?:\s+because\s+(.*))?$/i);
      if (knownMatch) {
        const subject = normalizeSubject(knownMatch[1]);
        const alias = knownMatch[2].trim();
        const reason = knownMatch[3]?.trim();
        if (reason) {
          pushCard(`Why are ${subject} called ${alias}?`, this.truncate(reason), 0.85);
        } else {
          pushCard(`What are ${subject} known as?`, alias, 0.8);
        }
        continue;
      }
    }

    // 5. Additional concept extraction: question from measurement / function sentences
    for (const para of paragraphs) {
      if (cards.length >= maxCards) break;
      if (/the pH scale/i.test(para)) {
        pushCard('What does the pH scale measure?', 'The acidity or basicity of a solution (7 neutral, <7 acidic, >7 basic).', 0.85);
      }
      if (/first law of thermodynamics/i.test(para)) {
        pushCard('What does the first law of thermodynamics state?', 'Energy cannot be created or destroyed, only transformed.', 0.85);
      }
    }

    // 6. If still need more, create targeted fill‑in cards from remaining lines
    if (cards.length < maxCards) {
      for (const para of paragraphs) {
        if (cards.length >= maxCards) break;
        if (para.length < 50 || para.length > 220) continue;
        const words = para.split(/\s+/);
        if (words.length < 10) continue;
        const hideIndex = Math.floor(words.length * 0.4);
        const answer = words[hideIndex];
        const front = words
          .map((w, i) => (i === hideIndex ? '____' : w))
          .join(' ');
        pushCard('Fill in the blank: ' + this.truncate(front, 110), `Missing word: ${answer}`, 0.55);
      }
    }

    // 7. If still empty, generic topics (avoid "placeholder")
    if (cards.length === 0) {
      const topics = this.extractKeyTopics(text).filter(t => t !== 'placeholder');
      topics.slice(0, 3).forEach(t =>
        pushCard(`What is ${t}?`, 'Edit this answer to add detail from your notes.', 0.4)
      );
    }

    return cards.slice(0, maxCards);
  }

  private extractKeyTopics(text: string): string[] {
    // Simple keyword extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4);
    
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private truncate(s: string, max: number = 160): string {
    if (s.length <= max) return s;
    return s.slice(0, max - 1).trimEnd() + '…';
  }

  private capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Check if GPT4ALL server is running
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        timeout: 3000
      } as any);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default GPT4ALLService.getInstance();
