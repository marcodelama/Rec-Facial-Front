<template>
    <div class="container">
        <h1 class="text-center">Registro con Reconocimiento Facial</h1>
        <div class="Cont-general">
            <div class="Cont-captura">
                <div class="card">
                    <div class="video-container">
                        <video ref="video" class="video" v-show="isCameraOn" autoplay muted
                            @play="handleVideoPlay"></video>
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
                    <button @click="startCamera" :disabled="isCameraOn" class="ACamara">
                        Abrir cámara
                    </button>
                </div>
            </div>

            <form @submit.prevent="submitForm" class="form">
                <div class="form-group">
                    <label for="dni">DNI</label>
                    <input type="text" id="dni" v-model="form.dni" required />
                </div>

                <div class="form-group">
                    <label for="nombre">Nombre completo</label>
                    <input type="text" id="nombre" v-model="form.nombre" required />
                </div>

                <div class="form-group">
                    <label for="apellidoPaterno">Apellido Paterno</label>
                    <input type="text" id="apellidoPaterno" v-model="form.apellidoPaterno" required />
                </div>

                <div class="form-group">
                    <label for="apellidoMaterno">Apellido Materno</label>
                    <input type="text" id="apellidoMaterno" v-model="form.apellidoMaterno" required />
                </div>

                <div class="form-group">
                    <label for="telefono">Teléfono</label>
                    <input type="text" id="telefono" v-model="form.telefono" required />
                </div>

                <div class="form-group">
                    <label for="direccion">Dirección</label>
                    <input type="text" id="direccion" v-model="form.direccion" required />
                </div>

                <div class="form-group">
                    <label for="correo">Correo</label>
                    <input type="email" id="correo" v-model="form.correo" required />
                </div>

                <div v-if="capturedImage" class="captured-image">
                    <h3>Imagen capturada:</h3>
                    <img :src="capturedImage" alt="Captured Face" />
                </div>

                <button type="submit" class="btn-submit" :disabled="!capturedImage">
                    Enviar
                </button>
            </form>
        </div>
    </div>
</template>

<script>
import "../style/reconocimientoF.css";
import * as faceapi from "face-api.js";
import axios from "axios";

export default {
    name: "RegistroFacial",
    data() {
        return {
            isCameraOn: false,
            isModelsLoaded: false,
            capturedImage: null,
            form: {
                dni: "",
                apellidoPaterno: "",
                apellidoMaterno: "",
                telefono: "",
                direccion: "",
                correo: "",
            },
        };
    },
    methods: {
        async loadModels() {
            const MODEL_URL = "./models";
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
        async submitForm() {
            try {
                const byteArray = await this.dataURItoBlob(this.capturedImage);
                const formData = new FormData();
                formData.append("dni", this.form.dni);
                formData.append("nombre", this.form.nombre);
                formData.append("apellido_paterno", this.form.apellidoPaterno);
                formData.append("apellido_materno", this.form.apellidoMaterno);
                formData.append("telefono", this.form.telefono);
                formData.append("direccion", this.form.direccion);
                formData.append("correo", this.form.correo);
                formData.append("imagen", byteArray, "captured_face.jpg");

                const response = await axios.post("http://127.0.0.1:8000/registrar/", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                alert("Datos enviados exitosamente!");
                console.log("Respuesta de la API:", response.data);
            } catch (error) {
                console.error("Error al enviar el formulario:", error);
                alert("Error al enviar los datos.");
            }
        },
        async dataURItoBlob(dataURI) {
            const byteString = atob(dataURI.split(",")[1]);
            const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], { type: mimeString });
        },
    },
    mounted() {
        this.loadModels();
    },
};
</script>

<style>
.Cont-general {
    display: flex;
    gap: 1.5rem;
}

/* Añade estilos básicos para el formulario */
.form {
    max-width: 400px;
    width: 300px;
    margin: 20px auto;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
}

button {
    width: 100%;
    padding: 10px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
}

button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.captured-image img {
    max-width: 100%;
    margin-top: 20px;
}

.text-center {
    text-align: center;
}
</style>