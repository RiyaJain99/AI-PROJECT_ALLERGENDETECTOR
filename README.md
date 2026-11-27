# 🥗 AllergenSafe — AI Food Allergen Detector

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&size=28&duration=3000&color=00F7FF&center=true&vCenter=true&width=700&lines=AI+Powered+Food+Safety;Detect+Allergens+in+Seconds;Vision+Transformer+Based+System" />
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/AI-Vision%20Transformer-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/ML-PyTorch-orange?style=for-the-badge&logo=pytorch" />
  <img src="https://img.shields.io/badge/Models-Hugging%20Face-yellow?style=for-the-badge&logo=huggingface" />
</p>

---

## 🧠 What is AllergenSafe?

For people with food allergies, eating out is stressful: you can't tell what's in a dish just by looking at it.

**AllergenSafe** gives a quick first check from a photo:

1. 📸 Upload a photo of a dish
2. 🧠 A fine-tuned **Vision Transformer (ViT)** identifies the dish and its confidence
3. ⚠️ Pick the allergen you care about, and the app checks it against an allergen database and shows **High Risk** or **Not typically present**, plus every allergen commonly found in that dish

> ⚠️ AllergenSafe recognises the **dish**, not the exact recipe. It is an early-warning tool, **not medical advice**. Always confirm ingredients with the restaurant, especially for severe allergies.

---

## 🎥 System Flow

```text
📸 Image upload (React)
        │
        ▼
🚀 FastAPI  /predict/
        │
        ▼
🖼 Preprocess: resize to 224×224, normalise
        │
        ▼
🧠 Vision Transformer (fine-tuned on Food-101)
        │
        ▼
🍽 Top prediction + confidence (softmax)
        │
        ▼
⚠️ Allergen lookup (allergens.json) for the selected allergen
        │
        ▼
📊 Result card + scan history
```

---

## ✨ Key Features

### 🔍 AI recognition
- 📸 Image-based food recognition across **101 dishes**
- 🧠 Vision Transformer fine-tuned from a pretrained Google model
- 📈 Confidence score for every prediction

### ⚠️ Allergen check
- 🥜 Covers **9 major allergens**: dairy, egg, fish, gluten, mustard, nuts, sesame, shellfish, soy
- 📚 Curated database of **100 dishes** with their typical ingredients and allergens
- 🔎 Checks the specific allergen the user selects, and lists all allergens for the dish
- ❔ Dishes with no allergen data return a clear **"no data"** result instead of a false "safe"

### 🎨 Interface
- 🗂 Scan history with search and Safe / Risk filters
- 📊 Summary counts of safe scans and scans with allergens detected

---

## 🧪 Model & Training

| Item | Detail |
|------|--------|
| Base model | `google/vit-base-patch16-224` (Hugging Face) |
| Dataset | Food-101: 101 dishes, ~1,000 images each |
| Approach | Transfer learning: fine-tuned the full pretrained ViT on Food-101 |
| Input | 224×224 RGB, normalised with the ViT processor's mean/std |
| Optimiser | Adam, learning rate 1e-5 |
| Batch size | 16 |
| Epochs | 2 |
| Output | 101-class softmax → top-1 dish + confidence |

Training script: `scripts/train_food_detector.py`

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Tailwind CSS v4, Lucide Icons |
| Backend | FastAPI, Uvicorn, python-multipart |
| ML | PyTorch, torchvision, Hugging Face Transformers, Pillow |
| Data | `allergens.json` (dish → ingredients → allergens), `labels.json` (class names) |
| Tools | Git, GitHub, Git LFS (model weights) |

---

## 🚀 Run Locally

> The trained weights (`models/food101_vit_base_patch16_224.pth`, ~343 MB) are stored with **Git LFS**. Run `git lfs pull` after cloning.

### ⚙️ Backend

```bash
git clone https://github.com/RiyaJain99/AI-PROJECT_ALLERGENDETECTOR.git
cd AI-PROJECT_ALLERGENDETECTOR
git lfs pull

python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.api:app --host 0.0.0.0 --port 8000
```

API: `http://127.0.0.1:8000` · Docs: `http://127.0.0.1:8000/docs`

### 🎨 Frontend

```bash
cd frontend
npm install
npm start
```

UI: `http://localhost:3000`

---

## 📁 Project Structure

```text
AI-PROJECT_ALLERGENDETECTOR/
├── app/
│   └── api.py                     # FastAPI inference API (/predict/)
├── scripts/
│   ├── train_food_detector.py     # Fine-tunes ViT on Food-101
│   └── predict_food_item.py       # Command-line prediction
├── models/
│   ├── vit/                       # ViT config + image processor config
│   └── food101_vit_base_patch16_224.pth   # Trained weights (Git LFS)
├── frontend/
│   ├── public/labels.json         # Class index → dish name
│   └── src/
│       ├── allergens.json         # Allergen database used by the UI
│       └── components/            # Detector + history views
├── requirements.txt
└── README.md
```

---

## 📊 Example Output

```text
Food:        Pasta Alfredo
Confidence:  94%
Checked for: Dairy  →  ⚠️ High Risk
All allergens in this dish: Dairy, Gluten
```

---

## ⚠️ Limitations

- Recognises the **dish**, not the exact recipe: restaurant versions may differ
- Hidden ingredients and cross-contamination **cannot** be seen in a photo
- Food-101 is mostly Western cuisine, so Indian dishes are not well covered yet
- One dish per photo; mixed plates (e.g. a thali) are not supported
- Accuracy drops on blurry or poorly lit photos

---

## 🔮 Future Enhancements

- 🇮🇳 Fine-tune on Indian dishes and expand the allergen database
- 👤 Saved allergy profile (multiple allergens checked at once)
- 🔢 Show top-3 predictions when confidence is low, and let the user confirm the dish
- 🧾 Scan menus / ingredient labels with OCR
- 🍱 Object detection for multiple dishes in one photo
- ☁️ Host the model API in the cloud for a fully online demo
- 📱 Mobile app

---

## 👩‍💻 Author

**Riya Jain**, B.Tech Computer Science (IoT), VIT Vellore
[GitHub](https://github.com/RiyaJain99) · [LinkedIn](https://www.linkedin.com/in/riya-jain-702b7b2b6/)

<p align="center"><i>"Food should be safe, not risky."</i></p>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:00F7FF,100:007CF0&height=120&section=footer"/>
