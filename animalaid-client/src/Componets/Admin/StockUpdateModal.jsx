import React, { useState } from 'react';
import { X, Package, DollarSign, User, Phone, FileText, Save } from 'lucide-react';
import Swal from 'sweetalert2';

const StockUpdateModal = ({ isOpen, onClose, product, productType, onSuccess }) => {
    const [formData, setFormData] = useState({
        quantity_added: '',
        unit_cost: '',
        supplier_name: '',
        supplier_phone: '',
        invoice_number: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/stocks/add-stock/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: product.id,
                    product_type: productType,
                    ...formData,
                    quantity_added: parseInt(formData.quantity_added),
                    unit_cost: parseFloat(formData.unit_cost)
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Swal.fire({
                    title: 'Stock Updated!',
                    text: data.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                onSuccess();
                onClose();
                setFormData({
                    quantity_added: '',
                    unit_cost: '',
                    supplier_name: '',
                    supplier_phone: '',
                    invoice_number: '',
                    notes: ''
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: data.error || 'Failed to update stock',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update stock. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const totalCost = formData.quantity_added && formData.unit_cost
        ? (parseInt(formData.quantity_added) * parseFloat(formData.unit_cost)).toFixed(2)
        : '0.00';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Update Stock</h2>
                        <p className="text-sm text-gray-600 mt-1">{product.name}</p>
                        <p className="text-xs text-gray-500">Current Stock: {product.piece} units</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Purchase Details */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                            <Package size={20} />
                            Purchase Details
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity to Add *
                                </label>
                                <input
                                    type="number"
                                    name="quantity_added"
                                    value={formData.quantity_added}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter quantity"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit Cost (৳) *
                                </label>
                                <input
                                    type="number"
                                    name="unit_cost"
                                    value={formData.unit_cost}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter unit cost"
                                />
                            </div>
                        </div>

                        {/* Total Cost Display */}
                        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Total Investment:</span>
                                <span className="text-2xl font-bold text-blue-600">৳{totalCost}</span>
                            </div>
                        </div>
                    </div>

                    {/* Supplier Details */}
                    <div className="bg-green-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                            <User size={20} />
                            Supplier Information (Optional)
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Supplier Name
                                </label>
                                <input
                                    type="text"
                                    name="supplier_name"
                                    value={formData.supplier_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter supplier name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="supplier_phone"
                                    value={formData.supplier_phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Invoice Number
                        </label>
                        <input
                            type="text"
                            name="invoice_number"
                            value={formData.invoice_number}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter invoice number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add any additional notes..."
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save size={18} />
                            {loading ? 'Updating...' : 'Update Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockUpdateModal;