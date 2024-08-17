const bot = document.getElementById('bot');
const botMessage = document.getElementById('bot-message');

bot.addEventListener('click', () => {
    botMessage.style.display = botMessage.style.display === 'none' ? 'block' : 'none';
    setTimeout(() => {
        botMessage.style.display = 'none';
    }, 5000);
});

const video = document.getElementById('webcam');
const emotionResult = document.getElementById('emotion-result');

// Access webcam
navigator.mediaDevices.getUserMedia({ video: {} })
  .then(stream => {
      video.srcObject = stream;
  });

// Load models for face detection and emotion recognition
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startEmotionDetection);

function startEmotionDetection() {
    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);

        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

            // Update emotion result
            if (detections[0] && detections[0].expressions) {
                const emotions = detections[0].expressions;
                const dominantEmotion = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
                emotionResult.textContent = `Emotion: ${dominantEmotion}`;
            }
        }, 100);
    });
}
const relaxationButton = document.getElementById('start-relaxation');

relaxationButton.addEventListener('click', () => {
    alert('Take a deep breath! Inhale... Exhale...');
});

function suggestRelaxation(dominantEmotion) {
    if (dominantEmotion === 'angry' || dominantEmotion === 'stressed') {
        relaxationButton.style.display = 'block';
    } else {
        relaxationButton.style.display = 'none';
    }
}
