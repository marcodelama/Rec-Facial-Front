<template>
  <div class="container">
    <h1 class="text-center">Reconocimiento Facial</h1>
    <div class="card">
      <div class="video-container">
        <video
          ref="video"
          class="video"
          v-show="isCameraOn"
          autoplay
          muted
          @play="handleVideoPlay"
        ></video>
        <canvas ref="canvas" class="canvas"></canvas>
      </div>
      <p v-if="!isCameraOn" class="text-center">
        Haz clic en "Abrir cámara" para empezar.
      </p>
    </div>

    <div class="button-group">
      <button @click="stopCamera" :disabled="!isCameraOn" class="DCamara">
        Desactivar cámara
      </button>
      <button @click="startCamera" :disabled="isCameraOn" class="ACamara">Abrir cámara</button>
      <button @click="sendCapturedImage" :disabled="!capturedImage" class="SendImage">Enviar imagen</button>
    </div>

    <div v-if="capturedImage" class="captured-image">
      <h3>Imagen capturada:</h3>
      <img :src="capturedImage" alt="Captured Face" />
    </div>
  </div>
</template>

<script>
import "../style/reconocimientoF.css";
import * as faceapi from "face-api.js";
import axios from "axios"; // Importar axios

export default {
  data() {
    return {
      isCameraOn: false,
      isModelsLoaded: false,
      capturedImage: null, // Imagen capturada
    };
  },
  methods: {
    async loadModels() {
      const MODEL_URL = "./models"; // Ruta a tus modelos
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      this.isModelsLoaded = true;
    },
    startCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            this.$refs.video.srcObject = stream;
            this.isCameraOn = true;
          })
          .catch((err) => {
            console.error("Error al acceder a la cámara: ", err);
          });
      }
    },
    stopCamera() {
      const video = this.$refs.video;
      if (video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        video.srcObject = null;
        this.isCameraOn = false;
      }
    },
    async captureImage() {
      if (!this.isModelsLoaded || !this.$refs.video) return;

      const video = this.$refs.video;
      const canvas = document.createElement("canvas");
      const displaySize = { width: video.videoWidth, height: video.videoHeight };

      canvas.width = displaySize.width;
      canvas.height = displaySize.height;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Detectar caras
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (detections.length > 0) {
        const faceBox = detections[0].box;
        const faceCanvas = document.createElement("canvas");
        faceCanvas.width = faceBox.width;
        faceCanvas.height = faceBox.height;

        faceCanvas
          .getContext("2d")
          .drawImage(
            canvas,
            faceBox.x,
            faceBox.y,
            faceBox.width,
            faceBox.height,
            0,
            0,
            faceBox.width,
            faceBox.height
          );

        this.capturedImage = faceCanvas.toDataURL("image/jpeg");
      } else {
        console.warn("No se detectaron caras.");
      }
    },
    async handleVideoPlay() {
      if (!this.isModelsLoaded) return;

      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
      }, 100);

      setTimeout(this.captureImage, 3000);
    },

    // Método para enviar la imagen capturada a la API
    async sendCapturedImage() {
      if (!this.capturedImage) return;

      try {
        const response = await axios.post("http://127.0.0.1:8000/reconocer/", {
          image: this.capturedImage, // Enviar imagen en base64
        });

        console.log("Respuesta de la API:", response.data);
        alert("Imagen enviada exitosamente!");
      } catch (error) {
        console.error("Error al enviar la imagen:", error);
        alert("Error al enviar la imagen.");
      }
    },
  },
  mounted() {
    this.loadModels();
  },
};
</script>

