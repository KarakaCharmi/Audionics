from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo
import os
import time
import shutil
from werkzeug.utils import secure_filename
from bson import ObjectId

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

# Mock audio separation logic (simulates generating identical files)
def mock_audio_separation(audio_file_path):
    try:
        print(f"Starting mock audio separation for file: {audio_file_path}")
        voice1_file = f"{audio_file_path}-voice1.wav"
        voice2_file = f"{audio_file_path}-voice2.wav"

        original_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_file_path)

        if not os.path.exists(original_path):
            raise FileNotFoundError('Original audio file not found.')

        # Simulate processing by copying the original file
        shutil.copy(original_path, os.path.join(app.config['UPLOAD_FOLDER'], voice1_file))
        shutil.copy(original_path, os.path.join(app.config['UPLOAD_FOLDER'], voice2_file))
        print("Mock audio separation completed successfully.")

        return [
            {"voiceId": "voice1", "filePath": voice1_file},
            {"voiceId": "voice2", "filePath": voice2_file},
        ]
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
        filename = secure_filename(f"{int(time.time())}-{file.filename}")
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

        # Mock audio separation
        separated_files = mock_audio_separation(filename)

        # Save processed audio details to MongoDB
        processed_audios = []
        for file_info in separated_files:
            processed_audio = {
                "filename": file_info["filePath"],
                "filePath": f"/uploads/{file_info['filePath']}",
                "isProcessed": True,
                "originalAudioId": str(original_audio_id)  # Convert ObjectId to string
            }
            processed_audio_id = audio_collection.insert_one(processed_audio).inserted_id
            processed_audios.append({
                **processed_audio,
                "_id": str(processed_audio_id)  # Convert ObjectId to string
            })

        return jsonify({
            "message": "File uploaded and processed successfully.",
            "originalAudio": {
                **original_audio,
                "_id": str(original_audio_id)  # Convert ObjectId to string
            },
            "processedAudios": processed_audios
        }), 200
    except Exception as e:
        print(f"Error processing the audio file: {str(e)}")
        return jsonify({"message": f"Error processing the audio file: {str(e)}"}), 500


@app.route('/uploads/<filename>', methods=['GET'])
def get_uploaded_file(filename):
    print(f"File requested: {filename}")
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(port=8000, debug=True)
