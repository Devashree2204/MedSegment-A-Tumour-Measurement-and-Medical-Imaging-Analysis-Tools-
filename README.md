# 🧠 MedSegment – A Tumour Measurement and Medical Imaging Analysis Tool

## 📄 Project Description
**MedSegment** is a full-stack web application that uses deep learning to detect, segment, and analyze brain tumours from MRI scans. Developed as part of my MSc dissertation at the University of Leicester, it combines AI-driven analysis with an intuitive user interface for medical professionals and researchers.

🧪 Key capabilities include:
- 📤 Uploading **T1-weighted NIfTI** brain MRIs
- 🧠 Tumour detection using a CNN (EfficientNet-B0)
- ✂️ Tumour segmentation via Attention U-Net
- 📐 Tumour metrics: **2D area**, **3D volume**, **surface area**, **sphericity**, and **SAVR**
- 🌀 3D tumour visualization with interactive controls
- 📄 Downloadable reports in **PDF** and **HTML**

-  ✅ Technologies: React · Flask · PyTorch · PostgreSQL

-  ## 🔧 Key Features

### ✅ Core Features
- 🧹 MRI preprocessing (e.g. skull stripping, normalization)
- 🧠 Tumour presence classification (Tumour vs Non-Tumour)
- ✂️ Tumour segmentation mask generation
- 📏 Metric calculations:
  - 2D area (per slice)
  - 3D tumour volume
  - Surface area
  - Surface-to-volume ratio
  - Sphericity (roundness)
- 📁 Support for **NIfTI (.nii.gz)** formats
- 📄 Report download in PDF/HTML

### 🌟 Additional Features
- 🌀 Interactive 3D tumour viewer (rotate, zoom, pan)
- 🌈 Brightness and contrast adjustment
- 🔐 User authentication and file history tracking


## 🛠️ Technologies Used

| Category              | Tools / Libraries                                              |
|-----------------------|---------------------------------------------------------------|
| **Frontend**          | React, CSS, @google/model-viewer, React Router DOM           |
| **Backend**           | Flask (Python), TorchScript, Postman (API Testing)           |
| **ML Frameworks**     | PyTorch, EfficientNet-B0, Attention U-Net                    |
| **Image Processing**  | NiBabel, Pillow, scikit-image                                |
| **3D Visualization**  | Trimesh                                                      |
| **Database**          | PostgreSQL                                                   |
| **Cloud**             | AWS EC2 GPU (g4dn.xlarge)                                    |


## 📊 Project Highlights
-🧠 Developed & trained tumour detection and segmentation models from scratch
-📈 Achieved 95%+ Dice Score using Attention U-Net
-🧪 Compared model performance across datasets and modalities
-🏆 Awarded Distinction & Prize Certificate at the University of Leicester

## 🎓 About This Project
This application was created as part of my MSc dissertation titled
**MedSegment – A Tumour Measurement and Medical Imaging Analysis Tool** at the University of Leicester.
👩‍🏫 Supervised by: Dr. Zedong Zheng
💾 Principal Marker: Dr. Artur Boronat

## 🎥 Live Demo
📽️ [Click here to watch the video demo on Google Drive](https://drive.google.com/file/d/1AbCDefGhIJkLMnoPQRsTuVWXYZ/view?usp=sharing)
This short video showcases tumour recognition, segmentation, metric analysis, and 3D visualization on the MedSegment platform.

## 📫 Contact
### Devshree Manish Deshmukh
### 📧 devshree2201@gmail.com
