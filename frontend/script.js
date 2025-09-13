const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
let capturedImageBlob = null;
 
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
 
    await faceapi.nets.tinyFaceDetector.loadFromUri('models');
    console.log("FaceAPI models loaded.");
  } catch (err) {
    alert("Camera access denied or unavailable. Please reload the page and allow access.");
    console.error("Camera error:", err);
  }
}
 
async function captureImage() {
  const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
  if (!detection) {
    alert("No face detected. Please ensure your face is visible and try again.");
    return;
  }
 
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
 
  canvas.toBlob(blob => {
    capturedImageBlob = blob;
    alert("Image captured.");
  }, 'image/jpeg');
}
 
function retake() {
  capturedImageBlob = null;
  alert("Ready to capture again.");
}
 
async function verify() {
  const referenceImage = document.getElementById('referenceImage').files[0];
  if (!capturedImageBlob || !referenceImage) {
    alert("Please capture a live image and upload a reference image.");
    return;
  }
 
  const formData = new FormData();
  formData.append("webcam_image", capturedImageBlob, "webcam.jpg");
  formData.append("reference_image", referenceImage);
 
  try {
    const res = await fetch("http://127.0.0.1:5000/verify_identity", {
      method: "POST",
      body: formData
    });
 
    const result = await res.json();
    document.getElementById("result").innerText = result.verified ? "✅ Verified" : "❌ Not Verified";
  } catch (err) {
    console.error("Verification request failed:", err);
    alert("Verification failed. Please try again.");
  }
}
 
// Start camera on page load
window.addEventListener('DOMContentLoaded', startCamera);