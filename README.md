# 🥗 AllergenSafe: AI-Powered Food Allergen Detector

AllergenSafe is a full-stack application that leverages advanced Computer Vision (Vision Transformer) to analyze food images and cross-reference them with a comprehensive clinical database to detect potential allergens. 

## ✨ Key Features

*   📸 **Image-Based Food Recognition**: Upload any food photo and let the AI identify the dish in seconds.
*   ⚠️ **Allergen Cross-Referencing**: Instantly cross-checks the identified food against a dataset of common allergens (Dairy, Gluten, Peanuts, Shellfish, Tree Nuts, etc.).
*   📊 **Clinical Dashboard UI**: A premium, responsive interface featuring dynamic routing, scan history tables, and interactive allergen guides.
*   📈 **Confidence Metrics**: Displays the AI model's confidence rating for every prediction.
*   🗂 **User History & Saves**: Filter and search through recent scans and personalized safe foods libraries.

## 🛠 Tech Stack

**Frontend:**
*   React.js
*   Tailwind CSS (V4)
*   Lucide Icons & Google Material Symbols

**Backend:**
*   FastAPI (Python)
*   PyTorch
*   Hugging Face Transformers (ViTForImageClassification)
*   Pillow (Python Imaging Library)

## 🚀 How to Run Locally

### 1. Start the Backend API
The backend requires Python and standard ML libraries. 
```bash
# 1. Activate the virtual environment
source venv/bin/activate

# 2. Run the FastAPI server
uvicorn app.api:app --host 0.0.0.0 --port 8000
```
*The API will be available at http://127.0.0.1:8000*

### 2. Start the Frontend App
The frontend is a standard React application.
```bash
cd frontend
npm install
npm start
```
*The application UI will run at http://localhost:3000*

## 📁 Project Structure 
*   `/app` - Contains the FastAPI Python backend logic and prediction handlers.
*   `/frontend` - Contains the React dashboard, UI components, and Tailwind config.
*   `/models` - Holds the custom trained Vision Transformer weights (`.pth`).
*   `allergens.json` - Custom database mapping known food items to potential allergen cross-contaminants.
*   `deployment_guide.md` - Instructions for containerizing and hosting the application.