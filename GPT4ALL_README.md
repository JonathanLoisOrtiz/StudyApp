# GPT4ALL Flashcard Generation Feature

This feature allows users to automatically generate flashcards from their class notes using GPT4ALL, an open-source AI model that runs locally.

## Features

- 📄 Upload text files (.txt) containing class notes
- 🤖 Automatically generate flashcards using AI
- 🔧 Edit generated cards before saving
- 📚 Add cards directly to any existing deck
- 🎨 Fully themed interface matching the app's design

## Current Status

### ✅ Implemented
- Basic file upload functionality
- Text extraction from .txt files
- Smart fallback card generation using text parsing
- Deck selection for generated cards
- Themed UI with proper navigation
- Error handling and user feedback

### 🔄 In Development
- GPT4ALL API integration (currently uses fallback method)
- PDF text extraction
- Image OCR support
- Batch card editing

## Setup Instructions

### Option 1: Using Fallback Text Processing (Current)
The app currently works out of the box with intelligent text processing that:
- Identifies definition patterns ("X is Y", "Term means...")
- Creates fill-in-the-blank questions
- Extracts key topics from notes
- Generates study questions automatically

### Option 2: Full GPT4ALL Integration (Advanced)

To enable true AI-powered card generation:

1. **Install GPT4ALL**
   ```bash
   pip install gpt4all
   ```

2. **Start GPT4ALL Server**
   ```bash
   # Download and start a model (first time)
   python -c "
   from gpt4all import GPT4All
   model = GPT4All('orca-mini-3b-gguf2-q4_0.gguf')
   model.chat_session()
   "
   
   # Or use the API server
   gpt4all --server --host 0.0.0.0 --port 4891
   ```

3. **Update Service Configuration**
   The `GPT4ALLService.ts` file is already set up. To enable it:
   - Ensure GPT4ALL server is running on `localhost:4891`
   - Uncomment the API call section in the `generateCards` method
   - Test the connection using the `checkConnection()` method

## How to Use

1. **Navigate to any deck** (Chemistry or Physics)
2. **Tap "🤖 From Notes"** button
3. **Upload a .txt file** with your class notes
4. **Select target deck** from the chips
5. **Tap "🤖 Generate Cards"** to process the notes
6. **Review generated cards** and edit if needed
7. **Tap "💾 Save All Cards"** to add them to your deck

## Best Practices for Notes

To get the best flashcard generation results:

### ✅ Good Note Formats
```
Photosynthesis is the process by which plants convert light energy into chemical energy.

The mitochondria are known as the powerhouse of the cell because they produce ATP.

Newton's First Law states that an object at rest stays at rest unless acted upon by an external force.
```

### ✅ Definition Lists
```
Key Terms:
- Osmosis: The movement of water across a semipermeable membrane
- Diffusion: The movement of molecules from high to low concentration
- Active Transport: Movement requiring energy input
```

### ❌ Avoid These Formats
- Pure bullet points without context
- Very short fragments
- Lists without explanations
- Heavily abbreviated notes

## File Structure

```
src/
├── screens/
│   └── UploadNotesScreen.tsx    # Main upload and generation UI
├── services/
│   └── GPT4ALLService.ts        # AI integration service
└── ...
```

## API Integration Details

The `GPT4ALLService` class provides:

```typescript
// Generate cards from text
generateCards(text: string, maxCards: number): Promise<GeneratedCard[]>

// Check if GPT4ALL server is running
checkConnection(): Promise<boolean>

// Configure server URL
setBaseUrl(url: string): void
```

## Troubleshooting

### Cards not generating properly?
- Check that your notes contain clear definitions or statements
- Try breaking complex topics into separate sentences
- Ensure sufficient text length (minimum ~100 characters)

### GPT4ALL connection issues?
- Verify server is running: `curl http://localhost:4891/models`
- Check firewall settings
- Try restarting the GPT4ALL server

### File upload problems?
- Currently only .txt files are supported
- Ensure file contains readable text
- Check file permissions

## Future Enhancements

- [ ] PDF text extraction using react-native-pdf-lib
- [ ] Image OCR using react-native-vision-camera + text-detector  
- [ ] Multiple AI model support
- [ ] Card quality scoring and filtering
- [ ] Batch operations (select/edit multiple cards)
- [ ] Custom prompt templates for different subjects
- [ ] Integration with online AI APIs (OpenAI, Claude, etc.)

## Contributing

To add new features or improve card generation:

1. Modify `GPT4ALLService.ts` for AI logic changes
2. Update `UploadNotesScreen.tsx` for UI improvements
3. Test with various note formats and file types
4. Update this README with new features

## Dependencies

- `@react-native-documents/picker` - File selection
- `react-native-fs` - File system access
- `gpt4all` (optional) - Local AI model

---

*This feature brings AI-powered study tools directly into your flashcard app, making it easier to convert class notes into effective study materials!*
