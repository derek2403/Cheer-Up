import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mood, date } = req.body;
    
    if (!mood || !date) {
      return res.status(400).json({ message: 'Mood and date are required' });
    }

    // Path to the mood.json file
    const filePath = path.join(process.cwd(), 'data', 'mood.json');
    
    // Read existing data
    let moodData = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      moodData = fileContent ? JSON.parse(fileContent) : [];
    }
    
    // Check if there's already an entry for today
    const existingEntryIndex = moodData.findIndex(entry => entry.date === date);
    
    if (existingEntryIndex !== -1) {
      // Update existing entry
      moodData[existingEntryIndex] = { mood, date };
    } else {
      // Add new entry
      moodData.push({ mood, date });
    }
    
    // Sort entries by date (newest first)
    moodData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(moodData, null, 2));
    
    return res.status(200).json({ message: 'Mood saved successfully' });
  } catch (error) {
    console.error('Error saving mood:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 