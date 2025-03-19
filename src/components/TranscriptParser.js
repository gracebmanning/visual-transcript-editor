export function parseTranscript(jsonInput) {
    try {
      const parsedData = JSON.parse(jsonInput);
  
      if (Array.isArray(parsedData)) {
        // Format 1: [{ word: "Hello", start: 1.23, end: 1.56 }, ...]
        return { transcript: parsedData };
      } else if (parsedData.results?.items) {
        // Format 2: AWS Transcribe-like JSON
        return {
          transcript: parsedData.results.items.map((item) => ({
            word: item.alternatives[0]?.content || "",
            start_time: parseFloat(item.start_time) || 0,
            end_time: parseFloat(item.end_time) || 0
          }))
        };
      } else {
        throw new Error("Unsupported transcript format");
      }
    } catch (error) {
      console.error("Error parsing transcript:", error);
      return null;
    }
}
  

/*
* Allow multiple formats (flexibility for different users).
* Auto-convert transcripts into a standardized internal format for processing.

* Internal Standard Format (For Consistent Processing):
{
  "transcript": [
    {
      "word": "Hello",
      "start_time": 1.23,
      "end_time": 1.56
    },
    {
      "word": "world",
      "start_time": 1.57,
      "end_time": 2.01
    }
  ]
}

*/