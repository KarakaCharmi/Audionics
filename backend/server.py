from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo
import os
import time
import shutil
from werkzeug.utils import secure_filename
import speech_recognition as sr
from pydub import AudioSegment
from bson import ObjectId
from pydub import AudioSegment

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB max size
app.config['MONGO_URI'] = "mongodb+srv://karakacharmi:charmi%401234@cluster0.lg88j.mongodb.net/Tutorials"

# Initialize MongoDB
print("Initializing MongoDB connection...")
mongo = PyMongo(app)
CORS(app)
print("MongoDB connected successfully!")

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
print(f"Upload directory set to: {app.config['UPLOAD_FOLDER']}")

# Allowed file types
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg'}

def allowed_file(filename):
    result = '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    print(f"Checking if file '{filename}' is allowed: {result}")
    return result

# Convert audio to WAV format


def prepare_voice_file(path: str) -> str:
    """
    Ensures the audio file is in a valid 16-bit PCM WAV format.
    """
    full_path = os.path.join(app.config['UPLOAD_FOLDER'], path)
    print(f"Preparing audio file: {path}")

    ext = os.path.splitext(full_path)[1].lower()
    wav_file = os.path.splitext(full_path)[0] + '_converted.wav'

    try:
        if ext == '.wav':
            # Check if it's already a PCM WAV
            audio = AudioSegment.from_wav(full_path)
            if audio.sample_width == 2:  # 16-bit PCM WAV has sample width of 2 bytes
                print("Audio file is already in 16-bit PCM WAV format.")
                return path

        # Convert to 16-bit PCM WAV
        print(f"Converting {path} to 16-bit PCM WAV format...")
        audio = AudioSegment.from_file(full_path, format=ext[1:])
        audio = audio.set_sample_width(2)  # Set to 16-bit (2 bytes per sample)
        audio.export(wav_file, format='wav')
        print(f"Conversion completed. New file: {wav_file}")
        return wav_file
    except Exception as e:
        print(f"Error during audio file preparation: {e}")
        raise ValueError(f"Failed to convert audio file to WAV format: {e}")
 # Print unsupported format

# Transcribe audio using Google Speech API
def transcribe_audio(audio_data, language) -> str:
    """
    Transcribes audio data to text using Google's speech recognition API.
    """
    r = sr.Recognizer()
    try:
        text = r.recognize_google(audio_data, language=language)
        return text
    except sr.UnknownValueError:
        return "Google Speech Recognition could not understand the audio."
    except sr.RequestError as e:
        return f"Could not request results from Google Speech Recognition service; {e}"

# Write transcription to file
def write_transcription_to_file(text, output_file) -> None:
    """
    Writes the transcribed text to the output file.
    """
    with open(output_file, 'w') as f:
        f.write(text)

# Mock audio separation logic (simulates generating identical files)
def mock_audio_separation(audio_file_path):
    try:
        print(f"Starting mock audio separation for file: {audio_file_path}")
        
        # Extract base filename without extension
        base_name = os.path.splitext(audio_file_path)[0]
        print(f"Base filename (without extension): {base_name}")
        
        # Get the first character of the base name and use it to determine the number of output files
        num_files = int(base_name[1])  # Assuming the first character is a number indicating the number of files
        print(f"Generating {num_files} audio files based on the first character of the base name.")

        # Create output filenames based on the number of required files
        output_files = []
        for i in range(1, num_files + 1):
            # Replace 'm' with the current index (i) in the base name
            updated_base_name = base_name.replace('m', str(i))
            print(f"Base name after replacing 'm' with {i}: {updated_base_name}")
            
            # Generate filenames with the correct pattern
            output_filename = f"{updated_base_name}.wav"  # Example: a31.wav, a32.wav, etc.
            output_files.append(output_filename)

            # Print each generated filename
            print(f"Generated output file: {output_filename}")

        print("Mock audio separation completed successfully.")

        # Return only the filenames, not the full paths
        return [{"voiceId": f"voice{i}", "filename": output_files[i - 1]} for i in range(1, num_files + 1)]
    
    except Exception as e:
        print(f"Error during mock audio separation: {e}")
        raise e
@app.route('/')
def home():
    print("Accessed the home route.")
    return "Welcome to the Flask backend!"

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"message": "No file uploaded."}), 400

    file = request.files['file']

    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"message": "Invalid file type. Only audio files are allowed."}), 400

    try:
        filename = secure_filename(f"{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Save original audio details to MongoDB
        audio_collection = mongo.db.Audio
        original_audio = {
            "filename": file.filename,
            "filePath": f"/uploads/{filename}",
            "isProcessed": False
        }
        original_audio_id = audio_collection.insert_one(original_audio).inserted_id

        # Mock audio separation (just generate filenames)
        separated_files = mock_audio_separation(filename)

        return jsonify({
            "message": "File uploaded and processed successfully.",
            "originalAudio": {
                **original_audio,
                "_id": str(original_audio_id)  # Convert ObjectId to string
            },
            "processedAudios": separated_files  # Return only the filenames
        }), 200
    except Exception as e:
        print(f"Error processing the audio file: {str(e)}")
        return jsonify({"message": f"Error processing the audio file: {str(e)}"}), 500

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio_from_file():
    data = request.json
    audio_file_path = data.get("audioFilePath")
    language = data.get("language", "en-US")
    print(f"Received transcription request for file: {audio_file_path}")
    print(f"Transcription language set to: {language}")

    # Check if audio_file_path is provided
    if not audio_file_path:
        return jsonify({"message": "No audio file path provided."}), 400

    try:
        # Prepare the audio file (convert it to WAV if necessary)
        print(f"Preparing audio file: {audio_file_path}")
        wav_file = prepare_voice_file(audio_file_path)
        print(f"Audio file prepared: {wav_file}")

        # Perform transcription using the Speech Recognition API
        with sr.AudioFile(wav_file) as source:
            print("Recording audio data...")
            audio_data = sr.Recognizer().record(source)
            print("Audio data recorded, starting transcription...")
            text = transcribe_audio(audio_data, language)
            print(f"Transcription completed: {text[:100]}...")  # Print the first 100 characters of the transcription
            return jsonify({"transcription": text}), 200
    except Exception as e:
        print(f"Error during transcription: {e}")
        return jsonify({"message": f"Error transcribing the audio: {str(e)}"}), 500
@app.route('/uploads/<filename>', methods=['GET'])
def get_uploaded_file(filename):
    print(f"File requested: {filename}")
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(port=8000, debug=True)
