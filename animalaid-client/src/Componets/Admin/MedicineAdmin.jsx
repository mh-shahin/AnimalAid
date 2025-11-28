import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, Info, Check, Package2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import StockUpdateModal from '../Admin/StockUpdateModal';

const MedicineAdmin = () => {

    const [formData, setFormData] = useState({
        name: '', quantity: '', piece: '', unit: '', category: '', price: '', offer: '', brand: '', description: '', generic_name: '', image: null
    });

    const [medicines, setMedicines] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const unitOptions = ['mg', 'g', 'kg', 'ml', 'L', 'tablet', 'capsule'];
    const categoryOptions = ['Antibiotic', 'Analgesic', 'Antiviral', 'Antifungal', 'Nutritional Supplement', 'Vitamin', 'Antihistamine', 'Antiseptic'];
    const genericNameOptions = ["Amoxicillin", "Enrofloxacin", "Ivermectin", "Vitamin B Complex", "Tylosin", "Doxycycline", "Albendazole", "Paracetamol", "Ciprofloxacin", "Oxytetracycline Dihydrate"];



    const fetchMedicines = async () => {
        try {
            const response = await fetch('http://localhost:8000/medicines/');
            if (!response.ok) {
                throw new Error('Failed to fetch medicines');
            }
            const data = await response.json();
            setMedicines(data);
        } catch (error) {
            console.error('Error fetching medicines:', error);
            toast.error('Failed to fetch medicines');
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);


    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const handleStockUpdate = (medicine) => {
        setSelectedProduct(medicine);
        setIsStockModalOpen(true);
    };

    const handleStockUpdateSuccess = () => {
        fetchMedicines(); // Refresh the list
        toast.success('✅ Stock updated successfully.');
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', formData.name);
        form.append('brand', formData.brand);
        form.append('quantity', formData.quantity);
        form.append('unit', formData.unit);
        form.append('category', formData.category);
        form.append('price', formData.price);
        form.append('discount', formData.offer || 0);
        form.append('generic_name', formData.generic_name);
        form.append('description', formData.description);
        form.append('piece', formData.piece || 0);
        if (formData.image) {
            form.append('image', formData.image);
        }

        if (editingId) {
            form.append('id', editingId);
        }

        try {
            const response = await fetch('http://localhost:8000/medicines/', {
                method: editingId ? 'PUT' : 'POST',
                body: form,
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Backend validation error:', data);
                throw new Error('Failed to add/update medicine');
            }

            if (editingId) {
                setMedicines(medicines.map((m) => (m.id === editingId ? data : m)));
            } else {
                setMedicines([...medicines, data]);
            }

            // ✅ SweetAlert2 success notification
            Swal.fire({
                title: editingId ? 'Medicine Updated!' : 'Medicine Added!',
                text: `Medicine "${formData.name}" has been ${editingId ? 'updated' : 'added'} successfully.`,
                icon: 'success',
                confirmButtonText: 'OK'
            });

            setFormData({
                name: '',
                quantity: '',
                unit: '',
                category: '',
                price: '',
                offer: '',
                generic_name: '',
                brand: '',
                description: '',
                piece: '',
                image: null
            });
            setEditingId(null);
            setIsFormVisible(false);
        } catch (error) {
            console.error('Error submitting medicine:', error);
            toast.error('❌ Failed to save medicine. Please try again.');
        }
    };



    const handleEdit = (m) => {
        setFormData({
            name: m.name,
            quantity: m.quantity,
            unit: m.unit,
            category: m.category,
            price: m.price,
            offer: m.discount,
            generic_name: m.generic_name,
            brand: m.brand,
            description: m.description,
            piece: m.piece,
            image: null
        });
        setEditingId(m.id);
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                const response = await fetch(`http://localhost:8000/medicines/?id=${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok && response.status !== 204) {
                    throw new Error('Delete failed');
                }

                setMedicines(prev => prev.filter(m => m.id !== id));
                toast.success(`✅ "${name}" deleted successfully.`);
            } catch (error) {
                console.error('Error deleting medicine:', error);
                toast.error(`❌ Failed to delete "${name}". Please try again.`);
            }
        }
    };

    // ✅ Filter based on search input
    const filteredMedicines = Array.isArray(medicines)
        ? medicines.filter((med) =>
            med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.category?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];


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
                            setFormData({ name: '', quantity: '', unit: '', category: '', price: '', offer: '', brand: '', description: '', piece: '', image: null });
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
                                    name="name"
                                    placeholder="Enter medicine name"
                                    value={formData.name}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Category*</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price <span className='font-extrabold'>(৳)</span>*</label>
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

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Medicine Generic Name*
                                </label>
                                <select
                                    name="generic_name"
                                    value={formData.generic_name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Generic Name</option>
                                    {genericNameOptions.map(generic => (
                                        <option key={generic} value={generic}>
                                            {generic}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Added Pieces of Medicines</label>
                                <input
                                    type="number"
                                    name="piece"
                                    placeholder="Enter number of total pieces"
                                    value={formData.piece}
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

                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Image</label>
                                <div className="flex items-center justify-between w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 transition duration-300">
                                    <label htmlFor="imageUpload" className="cursor-pointer text-indigo-600 hover:underline text-sm font-medium">
                                        Choose a file
                                    </label>
                                    <input
                                        id="imageUpload"
                                        type="file"
                                        name="image"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <span className="text-sm text-gray-500">JPG, PNG, JPEG</span>
                                </div>

                                {formData.image && (
                                    <p className="text-xs text-green-600 mt-1">✅ {formData.image.name} selected</p>
                                )}

                                <p className="text-xs text-gray-500 mt-2">
                                    📐 Recommended: 300x300px &nbsp; 📦 Max size: 2MB
                                </p>
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
                    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm max-w-md mx-auto my-8">
                        <div className="text-gray-300 mb-4">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-800 mb-2">No medicines found</h3>
                        <p className="text-gray-500 text-base text-center">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
                        {filteredMedicines.map((medicine) => (
                            <div key={medicine.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                                <div className="relative h-44 md:h-64 bg-gray-50">
                                    <img
                                        src={medicine.image}
                                        alt={medicine.name}
                                        className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-3 left-3 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                        Stock {medicine.piece}
                                    </div>
                                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                        {medicine.category}
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start gap-3 mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                            {medicine.name}
                                        </h3>
                                        <span className="bg-gray-100 text-gray-700 text-sm px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                                            {medicine.quantity} {medicine.unit}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                            {medicine.brand}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4 leading-relaxed flex-grow line-clamp-1">
                                        {medicine.description}
                                    </p>

                                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                                        <div>
                                            <p className="text-xl font-bold text-indigo-600"><span className="text-xl font-extrabold">৳</span>{medicine.price}</p>
                                            {medicine.discount && (
                                                <p className="text-sm font-medium text-green-600">
                                                    Save {medicine.discount}% off
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleStockUpdate(medicine)}
                                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-200"
                                                aria-label="Update stock"
                                                title="Update Stock"
                                            >
                                                <Package2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(medicine)}
                                                className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors duration-200"
                                                aria-label="Edit medicine"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(medicine.id, medicine.name)}
                                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
                                                aria-label="Delete medicine"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            </button>
                                            <StockUpdateModal
                                                isOpen={isStockModalOpen}
                                                onClose={() => setIsStockModalOpen(false)}
                                                product={selectedProduct}
                                                productType="medicine"
                                                onSuccess={handleStockUpdateSuccess}
                                            />
                                        </div>
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