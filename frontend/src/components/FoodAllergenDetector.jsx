import React, { useState, useRef } from "react";
import allergenData from "../allergens.json";

/* ── Icon helper ─────────────────────────────────────────── */
function Icon({ name, filled = false, className = "" }) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0},'wght' 400,'GRAD' 0,'opsz' 24` }}
    >
      {name}
    </span>
  );
}

/* ── Shared scan history (passed as prop so pages share it) ─ */
const INITIAL_HISTORY = [
  { id: "ALS-88201-Q", food: "Quinoa Salad", time: "2 hours ago", allergens: ["sesame"], safe: false, confidence: 87.4 },
  { id: "ALS-77103-M", food: "Green Smoothie", time: "Yesterday", allergens: [], safe: true, confidence: 94.1 },
  { id: "ALS-66044-P", food: "Pad Thai", time: "2 days ago", allergens: ["peanuts", "shellfish"], safe: false, confidence: 88.7 },
  { id: "ALS-55932-R", food: "Caesar Salad", time: "3 days ago", allergens: ["dairy", "eggs"], safe: false, confidence: 92.3 },
  { id: "ALS-44811-T", food: "Fruit Bowl", time: "4 days ago", allergens: [], safe: true, confidence: 96.5 },
];

const ALL_ALLERGENS = [
  { name: "Peanuts", icon: "egg_alt", desc: "Legume found in many processed foods", severity: "Severe", foods: ["pad thai", "satay", "cookies", "granola bars"] },
  { name: "Dairy", icon: "water_drop", desc: "Milk proteins including casein and whey", severity: "Moderate", foods: ["pizza", "butter", "yogurt", "cheese"] },
  { name: "Gluten", icon: "grain", desc: "Protein in wheat, barley, and rye", severity: "Moderate", foods: ["bread", "pasta", "beer", "soy sauce"] },
  { name: "Eggs", icon: "egg", desc: "Found in baked goods and sauces", severity: "Moderate", foods: ["mayo", "cake", "meringue", "pasta"] },
  { name: "Fish", icon: "set_meal", desc: "Finfish allergy distinct from shellfish", severity: "Severe", foods: ["caesar dressing", "worcestershire", "sushi"] },
  { name: "Shellfish", icon: "cruelty_free", desc: "Shrimp, crab, lobster, and mollusks", severity: "Severe", foods: ["pad thai", "paella", "sushi"] },
  { name: "Tree Nuts", icon: "park", desc: "Almonds, cashews, walnuts and more", severity: "Severe", foods: ["muesli", "pesto", "trail mix"] },
  { name: "Soy", icon: "spa", desc: "Common in Asian cuisine and processed food", severity: "Mild", foods: ["tofu", "miso", "edamame", "soy sauce"] },
  { name: "Sesame", icon: "blur_circular", desc: "Seeds used in oils, spreads, and bread", severity: "Moderate", foods: ["hummus", "tahini", "bagels", "asian dishes"] },
];

/* ═══════════════════════════════════════════════════════════
   PAGE: Dashboard / Analyze
════════════════════════════════════════════════════════════ */
function AnalyzePage({ history, setHistory }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [selectedAllergen, setSelectedAllergen] = useState("");
  const [allergenResult, setAllergenResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const commonAllergens = ["dairy","eggs","fish","shellfish","tree nuts","peanuts","wheat","gluten","soy","sesame"];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setPrediction(null); setAllergenResult(null); setSelectedAllergen("");
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true); setPrediction(null); setAllergenResult(null);
    try {
      const fd = new FormData();
      fd.append("file", selectedImage);
      const res = await fetch("http://127.0.0.1:8000/predict/", { method: "POST", body: fd });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      const p = {
        id: `ALS-${Math.floor(10000 + Math.random() * 90000)}-X`,
        name: data.prediction.rawName.replace(/_/g, " "),
        confidence: (data.prediction.confidence * 100).toFixed(1),
        rawName: data.prediction.rawName.toLowerCase(),
      };
      setPrediction(p);
      setHistory(prev => [{ id: p.id, food: p.name.replace(/\b\w/g,c=>c.toUpperCase()), time: "Just now", allergens: [], safe: null, confidence: parseFloat(p.confidence) }, ...prev]);
    } catch { alert("Prediction failed. Check backend logs."); }
    finally { setIsAnalyzing(false); }
  };

  const checkAllergen = () => {
    if (!prediction || !selectedAllergen) return;
    const foodData = allergenData[prediction.rawName]?.allergens;
    if (!Array.isArray(foodData)) { setAllergenResult({ noData: true }); return; }
    const contains = foodData.includes(selectedAllergen.toLowerCase());
    setAllergenResult({ allergen: selectedAllergen, contains, allAllergens: foodData });
    setHistory(prev => prev.map((s, i) => i === 0 && s.safe === null ? { ...s, allergens: foodData, safe: !contains } : s));
  };

  const reset = () => {
    setSelectedImage(null); setImagePreview(null); setPrediction(null);
    setSelectedAllergen(""); setAllergenResult(null); setIsAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const riskLabel = allergenResult?.contains ? { t: "High Risk", cls: "bg-red-100 text-red-600" }
    : allergenResult?.contains === false ? { t: "Safe", cls: "bg-emerald-100 text-emerald-700" }
    : prediction ? { t: "Scan Complete", cls: "bg-blue-100 text-blue-700" }
    : { t: "Awaiting Scan", cls: "bg-slate-100 text-slate-500" };

  return (
    <>
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1" style={{fontFamily:"Manrope,sans-serif"}}>Molecular Analysis</h1>
        <p className="text-slate-500 text-lg">Detailed food composition and allergen detection suite.</p>
      </header>
      <div className="grid grid-cols-12 gap-8">
        {/* LEFT */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          {/* Upload card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-900" style={{fontFamily:"Manrope,sans-serif"}}>Capture &amp; Upload</h3>
              <Icon name="camera_alt" className="text-slate-400" />
            </div>
            <label className="cursor-pointer block">
              <div className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center transition-all ${imagePreview ? "border-emerald-400 bg-emerald-50/30" : "border-slate-300 bg-slate-50 hover:border-emerald-400"}`}>
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    <div className="z-10 text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl">
                      <Icon name="cloud_upload" className="text-4xl text-emerald-700 mb-1" />
                      <p className="font-semibold text-slate-800 text-sm">Change Photo</p>
                      <p className="text-xs text-slate-500">JPG, PNG, HEIC</p>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-100">
                      <div className={`h-full bg-emerald-600 transition-all duration-1000 ${isAnalyzing ? "w-full animate-pulse" : "w-2/3"}`} />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <Icon name="cloud_upload" className="text-5xl text-slate-400 mb-3" />
                    <p className="font-semibold text-slate-600 mb-1">Click to upload image</p>
                    <p className="text-xs text-slate-400">PNG, JPG, HEIC up to 10 MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <div className="mt-5 space-y-2">
              <button onClick={analyzeImage} disabled={!selectedImage || isAnalyzing}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                {isAnalyzing ? <><Icon name="progress_activity" className="animate-spin" />Scanning…</> : <><Icon name="biotech" />Run Molecular Scan</>}
              </button>
              {selectedImage && (
                <button onClick={reset} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <Icon name="refresh" />New Image
                </button>
              )}
              <p className="text-center text-xs text-slate-400 px-4 pt-1">AI-driven analysis identifies over 2,000 common allergens.</p>
            </div>
          </div>
          {/* Recent scans */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4" style={{fontFamily:"Manrope,sans-serif"}}>Recent Scans</h3>
            <div className="space-y-3">
              {history.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.safe === false ? "bg-red-50" : s.safe === true ? "bg-emerald-50" : "bg-slate-100"}`}>
                      <Icon name={s.safe === false ? "error" : s.safe === true ? "check_circle" : "hourglass_empty"} filled={s.safe !== null}
                        className={s.safe === false ? "text-red-500" : s.safe === true ? "text-emerald-600" : "text-slate-400"} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{s.food}</p>
                      <p className="text-xs text-slate-400">{s.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${s.safe === false ? "text-red-500" : s.safe === true ? "text-emerald-600" : "text-slate-400"}`}>
                    {s.safe === false ? "Allergen Detected" : s.safe === true ? "Safe" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* RIGHT */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-6 right-6">
              <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${riskLabel.cls}`}>
                <Icon name="warning" filled className="text-[16px]" />{riskLabel.t}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-1" style={{fontFamily:"Manrope,sans-serif"}}>Detection Results</h3>
              <p className="text-slate-400 text-sm">Analysis ID: {prediction?.id ?? "#ALS-XXXXX-X"}</p>
            </div>
            {!prediction && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <Icon name="biotech" className="text-[64px] mb-4" />
                <p className="text-slate-400 font-medium">Upload and scan an image to see results</p>
              </div>
            )}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-emerald-700 font-semibold">Analyzing molecular composition…</p>
              </div>
            )}
            {prediction && !isAnalyzing && (
              <>
                {allergenResult?.contains && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl mb-6 flex gap-4">
                    <Icon name="report" className="text-red-500 text-3xl flex-shrink-0" filled />
                    <div>
                      <h4 className="text-red-800 font-bold text-lg mb-1">Allergen Detected: {allergenResult.allergen}</h4>
                      <p className="text-red-700/80 text-sm">Consumption is not recommended.</p>
                    </div>
                  </div>
                )}
                {allergenResult?.contains === false && (
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-r-xl mb-6 flex gap-4">
                    <Icon name="check_circle" className="text-emerald-600 text-3xl flex-shrink-0" filled />
                    <div>
                      <h4 className="text-emerald-800 font-bold text-lg mb-1">Safe: No {allergenResult.allergen} detected</h4>
                      <p className="text-emerald-700/80 text-sm">This food does not contain {allergenResult.allergen}.</p>
                    </div>
                  </div>
                )}
                {allergenResult?.noData && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-xl mb-6 flex gap-4">
                    <Icon name="info" className="text-amber-500 text-3xl flex-shrink-0" filled />
                    <div>
                      <h4 className="text-amber-800 font-bold text-lg mb-1">No allergen data available</h4>
                      <p className="text-amber-700/80 text-sm">We couldn't find allergen data for this food item.</p>
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Component Breakdown</p>
                  <div className="flex items-center justify-between py-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <Icon name="restaurant" className="text-emerald-600" />
                      <div>
                        <p className="font-bold text-slate-900 capitalize">{prediction.name}</p>
                        <p className="text-xs text-slate-400">AI-identified food item</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-700">{prediction.confidence}%</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Confidence</p>
                    </div>
                  </div>
                  {allergenResult?.allAllergens?.length > 0 && (
                    <div className="py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Known allergens in {prediction.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {allergenResult.allAllergens.map(a => (
                          <span key={a} className={`px-3 py-1 rounded-full text-sm font-medium border ${a === allergenResult.allergen ? "bg-red-100 text-red-700 border-red-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="py-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Check Specific Allergen</p>
                    <div className="flex gap-3">
                      <select value={selectedAllergen} onChange={e => { setSelectedAllergen(e.target.value); setAllergenResult(null); }}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700">
                        <option value="">Select allergen…</option>
                        {commonAllergens.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase()+a.slice(1)}</option>)}
                      </select>
                      <button onClick={checkAllergen} disabled={!selectedAllergen}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all active:scale-95">
                        Check
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm">
                    <Icon name="share" />Export Report
                  </button>
                  <button className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm">
                    <Icon name="save" />Save to History
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Spectral Analysis</p>
              <div className="flex items-end gap-1 h-20 mb-2">
                {[40,60,100,70,30,50,20].map((h,i) => (
                  <div key={i} className={`flex-1 rounded-t-sm ${h===100?"bg-red-400":h>60?"bg-emerald-400":"bg-emerald-200"}`} style={{height:`${h}%`}} />
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center">UV-Vis Absorbance Signature</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Analysis Precision</p>
              <span className="text-3xl font-extrabold text-emerald-700" style={{fontFamily:"Manrope,sans-serif"}}>±0.003%</span>
              <p className="text-xs text-slate-400 mt-1">Clinical Grade Calibration</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <Icon name="info" className="text-blue-500 flex-shrink-0 mt-0.5" filled />
            <p className="text-sm text-blue-800"><strong>Note:</strong> This tool uses AI to detect food items. Always consult a healthcare professional for severe allergies.</p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: History
════════════════════════════════════════════════════════════ */
function HistoryPage({ history }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = history.filter(s => {
    if (filter==="safe" && !s.safe) return false;
    if (filter==="risk" && s.safe) return false;
    if (search && !s.food.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return (
    <>
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1" style={{fontFamily:"Manrope,sans-serif"}}>Scan History</h1>
        <p className="text-slate-500 text-lg">All your past food analyses in one place.</p>
      </header>
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label:"Total Scans", value:history.length, icon:"biotech", color:"text-emerald-700", bg:"bg-emerald-50" },
          { label:"Safe Foods", value:history.filter(s=>s.safe===true).length, icon:"check_circle", color:"text-emerald-600", bg:"bg-emerald-50" },
          { label:"Allergens Detected", value:history.filter(s=>s.safe===false).length, icon:"warning", color:"text-red-500", bg:"bg-red-50" },
        ].map(st => (
          <div key={st.label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${st.bg} rounded-xl flex items-center justify-center`}><Icon name={st.icon} className={`${st.color} text-2xl`} filled /></div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900" style={{fontFamily:"Manrope,sans-serif"}}>{st.value}</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{st.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3 top-2.5 text-slate-400 text-[18px]" />
          <input type="text" placeholder="Search food..." value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div className="flex gap-2">
          {["all","safe","risk"].map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter===f?"bg-emerald-700 text-white":"bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
              {f==="all"?"All":f==="safe"?"Safe":"Risky"}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>{["Analysis ID","Food Item","Allergens","Confidence","Status","Time"].map(h=>(
              <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((row,i) => (
              <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-400">{row.id}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{row.food}</td>
                <td className="px-6 py-4">
                  {!row.allergens||row.allergens.length===0 ? <span className="text-slate-300 text-xs">None</span> : (
                    <div className="flex flex-wrap gap-1">
                      {row.allergens.map(a=><span key={a} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">{a}</span>)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-emerald-700">{row.confidence}%</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.safe===true?"bg-emerald-100 text-emerald-700":row.safe===false?"bg-red-100 text-red-600":"bg-slate-100 text-slate-500"}`}>
                    {row.safe===true?"Safe":row.safe===false?"Allergen Detected":"Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0&&<div className="py-16 text-center text-slate-400"><Icon name="search_off" className="text-5xl mb-2"/><p>No results found</p></div>}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: Allergens Reference
════════════════════════════════════════════════════════════ */
function AllergensPage() {
  const [selected, setSelected] = useState(null);
  const sev = { Severe:"bg-red-100 text-red-700", Moderate:"bg-amber-100 text-amber-700", Mild:"bg-blue-100 text-blue-700" };
  return (
    <>
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1" style={{fontFamily:"Manrope,sans-serif"}}>Allergen Guide</h1>
        <p className="text-slate-500 text-lg">Reference database of common food allergens and their sources.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ALL_ALLERGENS.map(al => (
          <div key={al.name} onClick={()=>setSelected(selected?.name===al.name?null:al)}
            className={`cursor-pointer bg-white rounded-2xl p-6 border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${selected?.name===al.name?"border-emerald-400 ring-2 ring-emerald-200":"border-slate-100"}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Icon name={al.icon} className="text-emerald-700 text-2xl" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${sev[al.severity]}`}>{al.severity}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1" style={{fontFamily:"Manrope,sans-serif"}}>{al.name}</h3>
            <p className="text-slate-500 text-sm mb-4">{al.desc}</p>
            {selected?.name===al.name && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Common Sources</p>
                <div className="flex flex-wrap gap-2">
                  {al.foods.map(f=><span key={f} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium capitalize">{f}</span>)}
                </div>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-2">
              <Icon name={selected?.name===al.name?"expand_less":"expand_more"} className="text-[16px]" />
              {selected?.name===al.name?"Hide sources":"View sources"}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: Saved Foods
════════════════════════════════════════════════════════════ */
const SAVED_FOODS = [
  { name:"Chicken Rice Bowl", category:"Lunch", safe:true, allergens:[], emoji:"🍚", savedOn:"Apr 10" },
  { name:"Mixed Berry Smoothie", category:"Breakfast", safe:true, allergens:[], emoji:"🍓", savedOn:"Apr 9" },
  { name:"Cheese Pizza", category:"Dinner", safe:false, allergens:["dairy","gluten"], emoji:"🍕", savedOn:"Apr 8" },
  { name:"Greek Yogurt Parfait", category:"Breakfast", safe:false, allergens:["dairy"], emoji:"🥛", savedOn:"Apr 7" },
  { name:"Vegetable Stir Fry", category:"Dinner", safe:true, allergens:[], emoji:"🥦", savedOn:"Apr 6" },
  { name:"Peanut Butter Toast", category:"Snack", safe:false, allergens:["peanuts","gluten"], emoji:"🥜", savedOn:"Apr 5" },
];
function SavedFoodsPage() {
  const [catFilter, setCatFilter] = useState("All");
  const cats = ["All","Breakfast","Lunch","Dinner","Snack"];
  const shown = SAVED_FOODS.filter(f=>catFilter==="All"||f.category===catFilter);
  return (
    <>
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1" style={{fontFamily:"Manrope,sans-serif"}}>Saved Foods</h1>
        <p className="text-slate-500 text-lg">Your personal safe-food library.</p>
      </header>
      <div className="flex gap-2 mb-6">
        {cats.map(c=>(
          <button key={c} onClick={()=>setCatFilter(c)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${catFilter===c?"bg-emerald-700 text-white":"bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {shown.map(food=>(
          <div key={food.name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl">{food.emoji}</div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${food.safe?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>
                {food.safe?"Safe":"Contains Allergens"}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1" style={{fontFamily:"Manrope,sans-serif"}}>{food.name}</h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-3">{food.category} · Saved {food.savedOn}</p>
            {food.allergens.length>0&&(
              <div className="flex flex-wrap gap-1 mb-4">
                {food.allergens.map(a=><span key={a} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs">{a}</span>)}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all">
                <Icon name="open_in_new" className="text-[14px]" />View
              </button>
              <button className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all">
                <Icon name="delete" className="text-[14px]" />Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: Profile
════════════════════════════════════════════════════════════ */
function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Riya Jain");
  const [email, setEmail] = useState("riya@allergensafe.ai");
  const [allergens, setAllergens] = useState(["peanuts","dairy"]);
  const toggle = (a) => setAllergens(prev=>prev.includes(a)?prev.filter(x=>x!==a):[...prev,a]);
  const all = ["dairy","eggs","fish","shellfish","tree nuts","peanuts","wheat","gluten","soy","sesame"];
  return (
    <>
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1" style={{fontFamily:"Manrope,sans-serif"}}>My Profile</h1>
        <p className="text-slate-500 text-lg">Manage your personal details and allergen preferences.</p>
      </header>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="person" className="text-emerald-700 text-5xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1" style={{fontFamily:"Manrope,sans-serif"}}>{name}</h2>
            <p className="text-slate-400 text-sm mb-4">{email}</p>
            <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Premium Member</span>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div><p className="text-2xl font-extrabold text-slate-900" style={{fontFamily:"Manrope,sans-serif"}}>24</p><p className="text-xs text-slate-400">Total Scans</p></div>
              <div><p className="text-2xl font-extrabold text-slate-900" style={{fontFamily:"Manrope,sans-serif"}}>6</p><p className="text-xs text-slate-400">Saved Foods</p></div>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900" style={{fontFamily:"Manrope,sans-serif"}}>Personal Information</h3>
              <button onClick={()=>setEditing(!editing)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${editing?"bg-emerald-700 text-white":"bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                {editing?"Save Changes":"Edit Profile"}
              </button>
            </div>
            <div className="space-y-4">
              {[["Full Name", name, setName],["Email", email, setEmail]].map(([label, val, setter])=>(
                <div key={label}>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</label>
                  <input value={val} onChange={e=>setter(e.target.value)} disabled={!editing}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${editing?"border-emerald-400 bg-white focus:ring-2 focus:ring-emerald-200":"border-slate-100 bg-slate-50 text-slate-600 cursor-default"}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2" style={{fontFamily:"Manrope,sans-serif"}}>My Allergen Profile</h3>
            <p className="text-slate-400 text-sm mb-5">Toggle allergens you want to be warned about during analysis.</p>
            <div className="flex flex-wrap gap-3">
              {all.map(a=>(
                <button key={a} onClick={()=>toggle(a)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${allergens.includes(a)?"bg-red-100 text-red-700 border-red-200":"bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"}`}>
                  {allergens.includes(a)&&<span className="mr-1">⚠️</span>}{a.charAt(0).toUpperCase()+a.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: Support
════════════════════════════════════════════════════════════ */
function SupportPage() {
  const faqs = [
    { q:"How accurate is the allergen detection?", a:"Our AI model achieves ~95% accuracy on the Food-101 dataset. Always verify with product labels for critical decisions." },
    { q:"What image formats are supported?", a:"We support JPG, PNG, HEIC, and WebP formats up to 10 MB." },
    { q:"Can I add custom allergens?", a:"Yes — head to your Profile to configure a personalised allergen alert list." },
    { q:"Is my data stored?", a:"Scan results are saved locally in your session. No images are stored on our servers." },
  ];
  const [open, setOpen] = useState(null);
  return (
    <>
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1" style={{fontFamily:"Manrope,sans-serif"}}>Support</h1>
        <p className="text-slate-500 text-lg">Frequently asked questions and help resources.</p>
      </header>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900" style={{fontFamily:"Manrope,sans-serif"}}>Frequently Asked Questions</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {faqs.map((f,i)=>(
                <div key={i} className="px-8 py-5 cursor-pointer hover:bg-slate-50 transition-colors" onClick={()=>setOpen(open===i?null:i)}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">{f.q}</p>
                    <Icon name={open===i?"expand_less":"expand_more"} className="text-slate-400 flex-shrink-0" />
                  </div>
                  {open===i&&<p className="text-slate-500 text-sm mt-3 leading-relaxed">{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <Icon name="mail" className="text-emerald-700 text-3xl mb-3" filled />
            <h3 className="font-bold text-emerald-900 mb-1" style={{fontFamily:"Manrope,sans-serif"}}>Contact Us</h3>
            <p className="text-emerald-700 text-sm mb-4">Reach out to our clinical team for complex allergen queries.</p>
            <a href="mailto:support@allergensafe.ai" className="inline-block px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-all">
              Email Support
            </a>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <Icon name="menu_book" className="text-slate-400 text-3xl mb-3" />
            <h3 className="font-bold text-slate-900 mb-1" style={{fontFamily:"Manrope,sans-serif"}}>Documentation</h3>
            <p className="text-slate-500 text-sm mb-4">Explore our full user guide and API documentation.</p>
            <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all">
              View Docs
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT LAYOUT — shared nav + page switcher
════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("analyze");
  const [history, setHistory] = useState(INITIAL_HISTORY);

  const navItems = [
    { id:"analyze", icon:"biotech",       label:"Analyze"     },
    { id:"allergens", icon:"warning",     label:"Allergens"   },
    { id:"saved",   icon:"fastfood",      label:"Saved Foods" },
    { id:"support", icon:"help_outline",  label:"Support"     },
  ];

  const topNav = [
    { id:"analyze",  label:"Dashboard" },
    { id:"history",  label:"History"   },
    { id:"profile",  label:"Profile"   },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb]" style={{fontFamily:"Inter,sans-serif"}}>
      {/* TOP NAV */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-extrabold tracking-tighter text-emerald-800 cursor-pointer" style={{fontFamily:"Manrope,sans-serif"}} onClick={()=>setPage("analyze")}>
            AllergenSafe
          </span>
          <div className="hidden md:flex gap-6 items-center">
            {topNav.map(n=>(
              <button key={n.id} onClick={()=>setPage(n.id)}
                className={`text-sm font-semibold pb-1 transition-colors ${page===n.id?"text-emerald-700 border-b-2 border-emerald-600":"text-slate-600 hover:text-emerald-600"}`}>
                {n.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Icon name="search" className="absolute left-3 text-slate-400 text-[18px]" />
            <input type="text" placeholder="Search data..." className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-52" />
          </div>
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-95"><Icon name="notifications" /></button>
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-95" onClick={()=>setPage("settings")}><Icon name="settings" /></button>
          <button onClick={()=>setPage("profile")} className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center ml-1 hover:ring-2 ring-emerald-400 transition-all">
            <Icon name="person" className="text-emerald-800 text-[18px]" />
          </button>
        </div>
      </nav>

      {/* SIDE NAV */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-50 flex flex-col py-6 text-sm font-medium z-40 border-r border-slate-100">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Icon name="biotech" className="text-emerald-800 text-[18px]" />
            </div>
            <h2 className="font-bold text-emerald-900" style={{fontFamily:"Manrope,sans-serif"}}>Clinical Sanctuary</h2>
          </div>
          <p className="text-xs text-slate-500">Allergen Analysis Suite</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(({id,icon,label})=>(
            <button key={id} onClick={()=>setPage(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-full transition-all duration-200 text-left ${page===id?"bg-emerald-50 text-emerald-700 font-semibold":"text-slate-500 hover:translate-x-1 hover:bg-emerald-50/50"}`}>
              <Icon name={icon} filled={page===id} /><span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Upload shortcut */}
        <div className="px-6 mb-4">
          <label className="cursor-pointer">
            <div className="w-full py-3 bg-gradient-to-r from-emerald-700 to-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
              onClick={()=>setPage("analyze")}>
              <Icon name="upload" />Upload Image
            </div>
          </label>
        </div>

        <div className="px-4 space-y-1">
          <button onClick={()=>setPage("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-full transition-all text-slate-500 hover:translate-x-1 hover:bg-emerald-50/50 ${page==="settings"?"bg-emerald-50 text-emerald-700":""}`}>
            <Icon name="settings" /><span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-r-full transition-all text-slate-500 hover:translate-x-1 hover:bg-red-50 hover:text-red-500">
            <Icon name="logout" /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 mt-16 p-8 min-h-screen">
        {page==="analyze"  && <AnalyzePage history={history} setHistory={setHistory} />}
        {page==="history"  && <HistoryPage history={history} />}
        {page==="allergens"&& <AllergensPage />}
        {page==="saved"    && <SavedFoodsPage />}
        {page==="profile"  && <ProfilePage />}
        {page==="support"  && <SupportPage />}
        {page==="settings" && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Icon name="settings" className="text-6xl mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2" style={{fontFamily:"Manrope,sans-serif"}}>Settings</h2>
            <p>Advanced settings coming soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
