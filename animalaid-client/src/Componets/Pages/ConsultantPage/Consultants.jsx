import React, { useState, useEffect } from 'react';
import { Camera, X, Upload, Send, AlertCircle, CheckCircle, Clipboard, ArrowLeft } from 'lucide-react';

const Consultants = () => {
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [animalType, setAnimalType] = useState('dog');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('upload'); // upload, analyzing, result

  const handleImageUpload = (e) => {
    if (images.length >= 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages([...images, { id: Date.now(), src: e.target.result }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (idToRemove) => {
    setImages(images.filter(image => image.id !== idToRemove));
  };

  const handleSubmit = () => {
    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }
    
    if (description.trim() === '') {
      setError("Please provide a description of the symptoms");
      return;
    }
    
    setError(null);
    setStep('analyzing');
    setIsAnalyzing(true);
    
    // Simulate AI analysis with setTimeout
    setTimeout(() => {
      // Mock results based on input
      const mockResults = {
        detectedIssue: description.toLowerCase().includes('scratch') ? 'Dermatitis' : 
                        description.toLowerCase().includes('eat') ? 'Digestive Issue' : 
                        'Possible Infection',
        confidence: Math.floor(Math.random() * 30) + 70, // Random confidence between 70-99%
        possibleCauses: [
          'Bacterial infection',
          'Allergic reaction',
          'Environmental factors'
        ],
        recommendedTreatment: description.toLowerCase().includes('scratch') ? 
          'Apply topical antibiotic cream twice daily and maintain the area clean and dry.' :
          'Maintain proper hydration and consider a bland diet for 24-48 hours.',
        recommendedMedicines: description.toLowerCase().includes('scratch') ? 
          [
            { name: 'HealSkin Antibiotic Ointment', dosage: 'Apply thin layer twice daily' },
            { name: 'AntiItch Spray', dosage: 'Use as needed for itching, not more than 4 times daily' }
          ] : 
          [
            { name: 'DigestEase', dosage: '1 tablet per 10kg body weight, twice daily' },
            { name: 'ProBiotic Pet', dosage: '1 capsule daily with food' }
          ],
        veterinaryAdvice: 'Please consult with a veterinarian within 48 hours if symptoms persist or worsen.'
      };
      
      setResult(mockResults);
      setIsAnalyzing(false);
      setStep('result');
    }, 3000);
  };

  const resetConsultation = () => {
    setImages([]);
    setDescription('');
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
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {['Poultry', 'Cow', 'bird', 'other'].map((animal) => (
                  <button
                    key={animal}
                    className={`p-3 rounded-lg text-center capitalize ${
                      animalType === animal ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border border-gray-200'
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
                Upload Images (Max 5) <span className="text-sm text-gray-500">- Show concerning areas clearly</span>
              </label>
              
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {images.map((image) => (
                  <div key={image.id} className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={image.src} alt="Uploaded" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(image.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
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
                className="w-full p-3 border border-gray-300 rounded-lg h-32"
                placeholder="Describe what you've noticed about your pet's behavior, eating habits, any visible symptoms, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-start">
                <AlertCircle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center"
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
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              <p>We're using advanced algorithms to detect potential health issues.</p>
              <p>This usually takes less than a minute.</p>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <button 
              onClick={resetConsultation}
              className="flex items-center text-blue-600 mb-4"
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
                <span className="font-bold text-lg">{result.detectedIssue}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {result.confidence}% confidence
                </span>
              </div>
            </div>
            
            {/* Possible Causes */}
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
            
            {/* Recommended Treatment */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Recommended Treatment:</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p>{result.recommendedTreatment}</p>
              </div>
            </div>
            
            {/* Recommended Medicines */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Recommended Medicines:</h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                {result.recommendedMedicines.map((medicine, index) => (
                  <div key={index} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{medicine.name}</p>
                      <p className="text-sm text-gray-600">{medicine.dosage}</p>
                    </div>
                    <button className="text-blue-600 text-sm">Find</button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Veterinary Advice */}
            <div className="mb-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <div className="flex">
                  <AlertCircle size={20} className="text-yellow-500 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Veterinary Advice:</h3>
                    <p className="text-yellow-700">{result.veterinaryAdvice}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-blue-600 text-white py-3 rounded-lg font-medium">
                Find Veterinarian
              </button>
              <button className="bg-white border border-blue-600 text-blue-600 py-3 rounded-lg font-medium flex items-center justify-center">
                <Clipboard size={16} className="mr-1" />
                Save Report
              </button>
            </div>
            
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