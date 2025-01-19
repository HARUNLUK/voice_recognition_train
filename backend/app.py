import matplotlib
matplotlib.use('Agg')  # Use a non-interactive backend for saving images

import os
import librosa
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.svm import SVC
import pickle
import io
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix
import seaborn as sns

app = Flask(__name__)
CORS(app)

# Helper function to extract MFCC features from audio data
def extract_mfcc_from_audio(audio_data):
    y, sr = librosa.load(io.BytesIO(audio_data), sr=None)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    return mfccs.mean(axis=1)

# Function to save the trained model for each user
def save_model(user_name, model):
    # Ensure the models directory exists
    os.makedirs('./models', exist_ok=True)
    
    # Save the model
    model_filename = f"models/model_{user_name}.pkl"
    with open(model_filename, 'wb') as f:
        pickle.dump(model, f)

# Load others' data from './data/others' directory
def load_others_data():
    others_data = []
    others_labels = []
    
    others_dir = './data/others'
    for file_name in os.listdir(others_dir):
        if file_name.endswith('.wav'):
            file_path = os.path.join(others_dir, file_name)
            with open(file_path, 'rb') as f:
                audio_data = f.read()
                mfcc_features = extract_mfcc_from_audio(audio_data)
                others_data.append(mfcc_features)
                others_labels.append(0)  # Label for others is 0
    
    return np.array(others_data), np.array(others_labels)

# Function to plot and save confusion matrix
def plot_confusion_matrix(y_true, y_pred, user_name):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(6, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Others', 'User'], yticklabels=['Others', 'User'])
    plt.title(f"Confusion Matrix for {user_name}")
    plt.ylabel('True label')
    plt.xlabel('Predicted label')
    plt.savefig(f'./models/confusion_matrix_{user_name}.png')
    plt.close()

# Endpoint to train a model for a user
@app.route('/train-model', methods=['POST'])
def train_model():
    if 'file' not in request.files or 'name' not in request.form:
        return jsonify({"error": "Missing file or name"}), 400

    file = request.files['file']
    user_name = request.form['name']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Read and extract MFCC features from the user's file (labeled as 1)
    audio_data = file.read()
    mfcc_features_user = extract_mfcc_from_audio(audio_data)
    
    # Load "others" data (labeled as 0)
    others_data, others_labels = load_others_data()

    # Create the training data by combining user's features and others' features
    X_train = np.vstack([mfcc_features_user, others_data])  # Stack user's and others' features
    y_train = np.concatenate([np.array([1]), others_labels])  # Label 1 for the user, 0 for others

    # Train the model (SVC classifier)
    model = SVC(kernel='linear')
    model.fit(X_train, y_train)

    # Make predictions to generate confusion matrix
    y_pred = model.predict(X_train)

    # Plot and save confusion matrix
    plot_confusion_matrix(y_train, y_pred, user_name)

    # Save the trained model for the user
    save_model(user_name, model)

    return jsonify({"message": f"Model for user {user_name} trained successfully!"})

# Endpoint to list all registered users
@app.route('/users', methods=['GET'])
def get_users():
    user_models = []
    models_dir = './models/'
    for file_name in os.listdir(models_dir):
        if file_name.endswith('.pkl'):
            user_name = file_name.replace('model_', '').replace('.pkl', '')
            user_models.append(user_name)
    return jsonify({"users": user_models})

# Endpoint for predicting based on selected user's model
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files or 'name' not in request.form:
        return jsonify({"error": "Missing file or name"}), 400

    file = request.files['file']
    user_name = request.form['name']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Read and extract MFCC features from the uploaded file
    audio_data = file.read()
    mfcc_features = extract_mfcc_from_audio(audio_data)

    # Load the model for the selected user
    model_filename = f"models/model_{user_name}.pkl"
    if not os.path.exists(model_filename):
        return jsonify({"error": f"Model for user {user_name} not found!"}), 400

    with open(model_filename, 'rb') as f:
        model = pickle.load(f)

    # Make prediction based on the user's model
    prediction = model.predict([mfcc_features])
    class_label = True if prediction[0] == 1 else False

    return jsonify({"prediction": class_label})

if __name__ == '__main__':
    # Ensure the models directory exists
    os.makedirs('./models', exist_ok=True)
    app.run(debug=True)
