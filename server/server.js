const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs'); // Used for file system operations

const Audio = require('./models/Audio'); // Import the Audio model

const app = express();
const port = 8000;

// MongoDB connection
mongoose.connect("mongodb+srv://karakacharmi:charmi%401234@cluster0.lg88j.mongodb.net/Tutorials")
  .then(() => {
    console.log('MongoDB connected successfully!');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000', // Allow your React frontend URL
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save uploaded files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Generate unique file names
  },
});

// Filter for audio files only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

// Initialize Multer upload with file validation
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50 MB
});

// Middleware to handle JSON requests
app.use(express.json());

// Serve static files (audio files) from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mock audio separation logic (Generate identical audio files)
const mockAudioSeparation = (audioFilePath) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Simulate creation of two identical processed audio files
        const voice1FilePath = `${audioFilePath}-voice1.wav`;
        const voice2FilePath = `${audioFilePath}-voice2.wav`;

        // Read the original audio file and write it twice to simulate separation
        const uploadPath = path.join(__dirname, 'uploads');  // Get absolute path
        const originalFilePath = path.join(uploadPath, audioFilePath);
        
        if (!fs.existsSync(originalFilePath)) {
          return reject(new Error('Original audio file not found.'));
        }

        const fileContent = fs.readFileSync(originalFilePath); // Read the original file
        
        // Save two identical processed files
        fs.writeFileSync(path.join(uploadPath, voice1FilePath), fileContent);
        fs.writeFileSync(path.join(uploadPath, voice2FilePath), fileContent);

        console.log(`Processed files saved: ${voice1FilePath}, ${voice2FilePath}`);

        resolve([
          { voiceId: 'voice1', filePath: voice1FilePath },
          { voiceId: 'voice2', filePath: voice2FilePath },
        ]);
      } catch (error) {
        reject(error);
      }
    }, 2000); // Simulate 2 seconds delay for the separation process
  });
};

// File upload route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded.' });
  }

  try {
    // Create a new audio document for the original file
    const originalAudio = new Audio({
      filename: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      isProcessed: false,
    });

    // Save the original audio document to the database
    await originalAudio.save();

    // Mock audio separation process
    const separatedFiles = await mockAudioSeparation(req.file.filename);

    // Save processed audio files to the database
    const processedAudios = await Promise.all(
      separatedFiles.map((file) =>
        new Audio({
          filename: file.filePath,
          filePath: `/uploads/${file.filePath}`,
          isProcessed: true,
          originalAudioId: originalAudio._id, // Reference to the original audio
        }).save()
      )
    );

    res.status(200).send({
      message: 'File uploaded and processed successfully.',
      originalAudio: originalAudio,
      processedAudios: processedAudios,
    });
  } catch (error) {
    console.error('Error saving audio to MongoDB:', error);
    res.status(500).send({ message: 'Error processing the audio file.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
