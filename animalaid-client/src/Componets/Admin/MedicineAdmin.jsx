import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, Info, Check } from 'lucide-react';

const MedicineAdmin = () => {
    const [formData, setFormData] = useState({
        medicineName: '', quantity: '', unit: '', category: '', price: '', offer: '', brand: '', description: '', image: null
    });
    const [medicines, setMedicines] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const unitOptions = ['mg', 'g', 'kg', 'ml', 'L', 'tablet', 'capsule', 'patch'];
    const categoryOptions = ['Antibiotic', 'Analgesic', 'Antiviral', 'Antifungal', 'Nutritional Supplement', 'Vitamin', 'Antihistamine', 'Antiseptic'];

    useEffect(() => {
        const mockMedicines = [
            { id: 1, medicineName: 'Paracetamol', quantity: '500', unit: 'mg', category: 'Analgesic', price: '5.99', offer: '10', brand: 'HealthCare', description: 'For fever and pain relief', imageUrl: '/api/placeholder/100/100' },
            { id: 2, medicineName: 'Vitamin C', quantity: '1000', unit: 'mg', category: 'Nutritional Supplement', price: '8.99', offer: '15', brand: 'NutraLife', description: 'Supports immune system', imageUrl: '/api/placeholder/100/100' },
            { id: 3, medicineName: 'Amoxicillin', quantity: '250', unit: 'mg', category: 'Antibiotic', price: '12.49', offer: '0', brand: 'PetMed', description: 'Broad spectrum antibiotic for bacterial infections', imageUrl: '/api/placeholder/100/100' },
            { id: 4, medicineName: 'Heartworm Plus', quantity: '1', unit: 'tablet', category: 'Antiparasitic', price: '18.99', offer: '5', brand: 'VetCare', description: 'Monthly heartworm prevention medicine', imageUrl: '/api/placeholder/100/100' },
            { id: 5, medicineName: 'Joint Supplement', quantity: '500', unit: 'g', category: 'Nutritional Supplement', price: '24.99', offer: '20', brand: 'PetHealth', description: 'Joint support with glucosamine and chondroitin for dogs', imageUrl: '/api/placeholder/100/100' },
            { id: 6, medicineName: 'Eye Drops', quantity: '10', unit: 'ml', category: 'Ophthalmic', price: '9.99', offer: '0', brand: 'ClearVision', description: 'For treating mild eye irritations', imageUrl: '/api/placeholder/100/100' }
        ];
        setMedicines(mockMedicines);
    }, []);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            setMedicines(medicines.map(m => m.id === editingId ? { ...m, ...formData, imageUrl: '/api/placeholder/100/100' } : m));
            showNotification(`Medicine "${formData.medicineName}" successfully updated!`);
            setEditingId(null);
        } else {
            setMedicines([...medicines, { ...formData, id: Date.now(), imageUrl: '/api/placeholder/100/100' }]);
            showNotification(`Medicine "${formData.medicineName}" successfully added!`);
        }
        setFormData({ medicineName: '', quantity: '', unit: '', category: '', price: '', offer: '', brand: '', description: '', image: null });
        setIsFormVisible(false);
    };

    const handleEdit = (m) => {
        setFormData({
            medicineName: m.medicineName,
            quantity: m.quantity,
            unit: m.unit,
            category: m.category,
            price: m.price,
            offer: m.offer,
            brand: m.brand,
            description: m.description,
            image: null
        });
        setEditingId(m.id);
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            setMedicines(medicines.filter(m => m.id !== id));
            showNotification(`Medicine "${name}" successfully deleted!`, 'error');
        }
    };

    const filteredMedicines = medicines.filter(m =>
        m.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen p-3 md:p-6 bg-gray-50">
            {notification.show && (
                <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${notification.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' : 'bg-green-100 text-green-800 border-l-4 border-green-500'
                    }`}>
                    {notification.type === 'error' ? <Info size={18} /> : <Check size={18} />}
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">Medicine Administration</h1>
                    <button
                        onClick={() => {
                            setFormData({ medicineName: '', quantity: '', unit: '', category: '', price: '', offer: '', brand: '', description: '', image: null });
                            setEditingId(null);
                            setIsFormVisible(!isFormVisible);
                        }}
                        className="w-full md:w-auto px-4 py-2 rounded-lg flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-md"
                    >
                        {isFormVisible ? <X size={18} /> : <Plus size={18} />}
                        {isFormVisible ? 'Cancel' : 'Add Medicine'}
                    </button>
                </header>

                {isFormVisible && (
                    <form onSubmit={handleSubmit} className="p-4 md:p-6 mb-8 rounded-lg border bg-white border-gray-200 shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                            {editingId ? 'Edit Medicine' : 'Add New Medicine'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name*</label>
                                <input
                                    type="text"
                                    name="medicineName"
                                    placeholder="Enter medicine name"
                                    value={formData.medicineName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand*</label>
                                <input
                                    type="text"
                                    name="brand"
                                    placeholder="Enter brand name"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    placeholder="Enter quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit*</label>
                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Unit</option>
                                    {unitOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Category</option>
                                    {categoryOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)*</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    placeholder="Enter price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    name="offer"
                                    placeholder="Enter discount percentage"
                                    value={formData.offer}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="form-group col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Enter medicine description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="form-group col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Recommended size: 300x300px. Max size: 2MB.</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsFormVisible(false)}
                                className="px-4 py-2 mr-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors"
                            >
                                {editingId ? 'Update Medicine' : 'Add Medicine'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mb-6 relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, brand, or category"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {filteredMedicines.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No medicines found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredMedicines.map((medicine) => (
                            <div key={medicine.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                <div className="relative pb-[70%] bg-gray-100">
                                    <img
                                        src={medicine.imageUrl}
                                        alt={medicine.medicineName}
                                        className="absolute w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-semibold text-gray-800">{medicine.medicineName}</h3>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{medicine.category}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{medicine.brand}</p>
                                    <div className="mt-2 flex items-center">
                                        <span className="text-lg font-bold text-indigo-600">${medicine.price}</span>
                                        {medicine.offer !== '0' && medicine.offer !== '' && (
                                            <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">{medicine.offer}% off</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{medicine.quantity} {medicine.unit}</p>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{medicine.description}</p>
                                    <div className="flex justify-end mt-3 pt-3 border-t border-gray-100 gap-2">
                                        <button
                                            onClick={() => handleEdit(medicine)}
                                            className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                                            title="Edit medicine"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(medicine.id, medicine.medicineName)}
                                            className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors"
                                            title="Delete medicine"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredMedicines.length > 0 && (
                    <div className="mt-6 text-center text-gray-500 text-sm">
                        Showing {filteredMedicines.length} of {medicines.length} medicines
                    </div>
                )}
            </div>
        </div>
    );
};

// Add this to style.css or inline style for line clamping (truncating text)
const style = document.createElement('style');
style.textContent = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
document.head.appendChild(style);

export default MedicineAdmin;