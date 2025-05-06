from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import tempfile
import os

app = Flask(__name__)
CORS(app)

@app.route('/verify_identity', methods=['POST'])
def verify_identity():
    webcam_file = request.files['webcam_image']
    ref_file = request.files['reference_image']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as webcam_temp:
        webcam_file.save(webcam_temp.name)
        webcam_path = webcam_temp.name

    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as ref_temp:
        ref_file.save(ref_temp.name)
        ref_path = ref_temp.name

    try:
        result = DeepFace.verify(img1_path=webcam_path, img2_path=ref_path, enforce_detection=False)
        verified = result['verified']
    except Exception as e:
        return jsonify({"verified": False, "error": str(e)})
    finally:
        os.remove(webcam_path)
        os.remove(ref_path)

    return jsonify({"verified": verified})

if __name__ == '__main__':
    app.run(debug=True)
