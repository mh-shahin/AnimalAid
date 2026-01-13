import React, { useState, useEffect } from 'react';
import { Camera, X, Send, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../../Authentication/auth.js';
import toast from 'react-hot-toast';

const Consultants = () => {
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [animalType, setAnimalType] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('upload');
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ FIXED: Restore form data after login with proper File conversion
  useEffect(() => {
    const savedData = sessionStorage.getItem('consultationData');
    if (savedData && isAuthenticated()) {
      try {
        const data = JSON.parse(savedData);
        
        // Restore text fields
        setDescription(data.description || '');
        setAnimalType(data.animalType || '');
        
        // Convert base64 back to File objects
        if (data.images && data.images.length > 0) {
          const restoredImages = data.images.map((base64, idx) => {
            try {
              // Split the base64 string
              const arr = base64.split(',');
              const mime = arr[0].match(/:(.*?);/)[1];
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              
              const blob = new Blob([u8arr], { type: mime });
              const file = new File([blob], `restored-image-${idx}.jpg`, { type: mime });
              
              return {
                id: Date.now() + idx,
                src: base64,
                file: file
              };
            } catch (err) {
              console.error('Error converting base64 to file:', err);
              return null;
            }
          }).filter(Boolean); // Remove null values
          
          setImages(restoredImages);
        }
        
        // Clear saved data
        sessionStorage.removeItem('consultationData');
        
        // Show success message
        toast.success('Form data restored! Please submit again.');
        
      } catch (err) {
        console.error('Error restoring data:', err);
        sessionStorage.removeItem('consultationData');
      }
    }
  }, []); // Only run once on mount

  const handleImageUpload = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (images.length >= 3) { 
      setError("Maximum 3 images allowed"); 
      setTimeout(() => setError(''), 3000);
      return; 
    }
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (ev) => {
      setImages(prev => [...prev, { 
        id: Date.now(), 
        file: file, 
        src: ev.target.result 
      }]);
    };
    
    reader.readAsDataURL(file);
  };

  const removeImage = (idToRemove) => {
    setImages(images.filter(image => image.id !== idToRemove));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault && e.preventDefault();

    // ✅ Check authentication FIRST
    if (!isAuthenticated()) {
      toast.error('Please login to submit for analysis');
      
      // Save form data before redirecting
      sessionStorage.setItem('consultationData', JSON.stringify({
        images: images.map(img => img.src), // base64 strings
        description,
        animalType
      }));
      
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Validation
    if (images.length === 0) {
      setError("Please upload at least one image");
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (images.length > 3) {
      setError("Maximum 3 images allowed");
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (!animalType) {
      setError("Please select an animal type");
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (description.trim() === '') {
      setError("Please provide a description of the symptoms");
      setTimeout(() => setError(''), 3000);
      return;
    }

    setError(null);
    setStep('analyzing');
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append('animal_type', animalType);
    formData.append('description', description);

    // Append image files
    images.forEach((img, idx) => {
      const file = img.file;
      if (file) {
        formData.append(`image${idx + 1}`, file);
      }
    });

    // Debug: Log FormData contents
    console.log("📤 Submitting consultation:");
    for (const pair of formData.entries()) {
      const key = pair[0];
      const value = pair[1];
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/consultant/analyze/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.error || data?.detail || JSON.stringify(data);
        setError("Server error: " + errMsg);
        setStep('upload');
        toast.error("Analysis failed: " + errMsg);
        return;
      }
      
      const aiResult = data?.result || data;
      setResult(aiResult);
      setStep('result');
      toast.success('Analysis complete!');
      
    } catch (err) {
      console.error("❌ Network error:", err);
      setError("Network error while contacting backend. Check server.");
      setStep('upload');
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetConsultation = () => {
    setImages([]);
    setDescription('');
    setAnimalType('');
    setResult(null);
    setError(null);
    setStep('upload');
    setIsAnalyzing(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Pet Health Consultation</h1>
        <p className="text-sm opacity-90">Upload images and describe symptoms for AI analysis</p>
      </div>

      <div className="container mx-auto p-4 max-w-3xl">
        {step === 'upload' && (
          <>
            {/* Animal Type Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Select your pet type
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['Poultry', 'Cow', 'Bird', 'Fish'].map((animal) => (
                  <button
                    key={animal}
                    type="button"
                    className={`p-3 rounded-lg text-center capitalize transition-all ${
                      animalType === animal
                        ? 'bg-blue-100 border-2 border-blue-500 font-semibold'
                        : 'bg-white border border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setAnimalType(animal)}
                  >
                    {animal}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Upload Images (Max 3) <span className="text-sm text-gray-500">- Show concerning areas clearly</span>
              </label>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {images.map((image) => (
                  <div key={image.id} className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={image.src} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {images.length < 3 && (
                  <label className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors">
                    <Camera size={24} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Photo</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Description Input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Describe the symptoms
              </label>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what you've noticed about your pet's behavior, eating habits, any visible symptoms, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-start rounded">
                <AlertCircle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Send size={18} className="mr-2" />
              Submit for Analysis
            </button>

            {/* Disclaimer */}
            <p className="mt-4 text-sm text-gray-500 text-center">
              This AI analysis is not a substitute for professional veterinary care.
              Please consult a veterinarian for proper diagnosis and treatment.
            </p>
          </>
        )}

        {step === 'analyzing' && (
          <div className="text-center py-12">
            <div className="animate-pulse bg-blue-100 inline-block p-6 rounded-full mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">Analyzing your pet's condition</h2>
            <p className="text-gray-600 mb-6">Our AI is examining the images and symptoms...</p>
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 max-w-md mx-auto">
              <p>We're using advanced algorithms to detect potential health issues.</p>
              <p>This usually takes less than a minute.</p>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <button
              type="button"
              onClick={resetConsultation}
              className="flex items-center text-blue-600 mb-4 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>New Consultation</span>
            </button>

            {/* Result Header */}
            <div className="bg-green-50 p-4 rounded-lg mb-6 flex items-start">
              <CheckCircle size={24} className="text-green-500 mr-2 flex-shrink-0" />
              <div>
                <h2 className="font-bold text-lg text-gray-800">Analysis Complete</h2>
                <p className="text-sm text-gray-600">Based on the provided information, we've generated the following assessment</p>
              </div>
            </div>

            {/* Detection Result */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Detected Issue:</h3>
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <span className="font-bold text-lg">{result.detectedIssue || "Not Available"}</span>
                {result.confidence && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {result.confidence}% confidence
                  </span>
                )}
              </div>
            </div>

            {/* Possible Causes */}
            {result.possibleCauses && result.possibleCauses.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Possible Causes:</h3>
                <ul className="bg-gray-50 p-3 rounded-lg space-y-1">
                  {result.possibleCauses.map((cause, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Treatment */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Recommended Treatment:</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p>{result.recommendedTreatment || "No treatment information available."}</p>
              </div>
            </div>

            {/* Recommended Medicines */}
            {result.recommendedMedicines && result.recommendedMedicines.length > 0 && (
              <div className="mb-6 border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <h3 className="font-medium text-sky-700 mb-2">Recommended Medicines:</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  {result.recommendedMedicines.map((medicine, index) => (
                    <div key={index} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">
                          Medicine Name:{" "}
                          <Link
                            to={`/medicin/${medicine.id}`}
                            className="font-bold text-blue-700 text-xl ml-2 hover:underline hover:text-blue-900 transition-all"
                          >
                            {medicine.name}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-bold">Dosage:</span> {medicine.dosage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Suggested Medicines */}
            {result.additionalMedicines && result.additionalMedicines.length > 0 && (
              <div className="mb-6 border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <h3 className="font-medium text-sky-700 mb-2">Additional Suggested Medicines:</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  {result.additionalMedicines.map((medicine, index) => (
                    <div key={index} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">
                          Medicine Name: <span className="font-bold text-blue-700 text-xl ml-2">{medicine.name}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-bold">Dosage:</span> {medicine.dosage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Veterinary Advice */}
            {result.veterinaryAdvice && (
              <div className="mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <div className="flex">
                    <AlertCircle size={20} className="text-yellow-500 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Veterinary Advice:</h3>
                      <p className="text-yellow-700">{result.veterinaryAdvice}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="mt-6 text-sm text-gray-500 text-center">
              This AI analysis is not a substitute for professional veterinary care.
              Please consult a veterinarian for proper diagnosis and treatment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultants;