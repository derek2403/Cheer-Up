// pages/api/imagegen.js
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

export default async function handler(req, res) {
    const { scenario } = req.body;
  
    // Read prompt template from file
    let promptTemplate;
    try {
      const promptPath = path.join(process.cwd(), 'ai-prompts', 'DallE-prompt.txt');
      promptTemplate = await fsPromises.readFile(promptPath, 'utf8');
    } catch (err) {
      console.error("Error reading prompt template:", err);
      return res.status(500).json({ error: "Failed to read prompt template" });
    }
    
    // Replace the scenario placeholder
    const prompt = promptTemplate.replace('${scenario}', scenario);
  
    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-2",
          prompt,
          n: 1,
          size: "512x512",
          response_format: "url",
          quality: "hd",
        }),
      });
  
      const data = await response.json();
      console.log("OpenAI API Response:", JSON.stringify(data));
      
      if (data.error) {
        console.error("OpenAI API Error:", data.error);
        return res.status(500).json({ error: data.error.message || "Image generation failed" });
      }
      
      if (!data.data || !data.data[0] || !data.data[0].url) {
        console.error("Unexpected API response structure:", data);
        return res.status(500).json({ error: "Invalid response from image generation API" });
      }
      
      const imageUrl = data.data[0].url;
      
      // Create directory if it doesn't exist
      const imgDir = path.join(process.cwd(), 'data', 'img');
      try {
        await fsPromises.mkdir(imgDir, { recursive: true });
      } catch (err) {
        console.error("Error creating directory:", err);
      }
      
      // Get the next image index
      let nextIndex = 1;
      try {
        const files = await fsPromises.readdir(imgDir);
        const pngFiles = files.filter(file => file.endsWith('.png'));
        if (pngFiles.length > 0) {
          const indices = pngFiles
            .map(file => parseInt(file.replace(/[^0-9]/g, ''), 10))
            .filter(num => !isNaN(num));
          if (indices.length > 0) {
            nextIndex = Math.max(...indices) + 1;
          }
        }
      } catch (err) {
        console.error("Error reading directory:", err);
      }
      
      // Download and save the image
      const imagePath = path.join(imgDir, `${nextIndex}.png`);
      try {
        const imageResponse = await fetch(imageUrl);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fsPromises.writeFile(imagePath, buffer);
        console.log(`Image saved to ${imagePath}`);
      } catch (err) {
        console.error("Error saving image:", err);
      }
      
      res.status(200).json({ 
        image: imageUrl,
        savedPath: `/data/img/${nextIndex}.png`
      });
    } catch (err) {
      console.error("Exception during image generation:", err);
      res.status(500).json({ error: "Image generation failed: " + (err.message || "Unknown error") });
    }
  }