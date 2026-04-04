import React, { useState, useEffect } from 'react';
import { X, Package, User, Save } from 'lucide-react';
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

    // ✅ Auto-fill when modal opens
    useEffect(() => {
        if (isOpen && product) {
            setFormData({
                quantity_added: '', // keep empty intentionally
                unit_cost: product.price ? parseFloat(product.price) : '',
                supplier_name: '',
                supplier_phone: '',
                invoice_number: '',
                notes: ''
            });
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    // ✅ Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // ✅ Calculate total cost safely
    const totalCost =
        formData.quantity_added && formData.unit_cost
            ? (Number(formData.quantity_added) * Number(formData.unit_cost)).toFixed(2)
            : '0.00';

    // ✅ Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                product_id: product.id,
                product_type: productType,
                ...formData,
                quantity_added: Number(formData.quantity_added),
                unit_cost: Number(formData.unit_cost)
            };

            const response = await fetch('http://localhost:8000/api/stocks/add-stock/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                await Swal.fire({
                    title: 'Stock Updated!',
                    text: data.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                onSuccess();
                onClose();

                // Reset form
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
            console.error('Stock update error:', error);

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                    <div>
                        <h2 className="text-2xl font-bold">Update Stock</h2>
                        <p className="text-sm text-gray-600">{product.name}</p>
                        <p className="text-xs text-gray-500">
                            Current Stock: {product.piece} units
                        </p>
                        <p className="text-xs text-gray-500">
                            Current Unit Cost: ৳ {product.price}
                        </p>
                    </div>

                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Purchase Section */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Package size={18} /> Purchase Details
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">

                            {/* Quantity */}
                            <div>
                                <label className="text-sm font-medium">Quantity to Add *</label>
                                <input
                                    type="number"
                                    name="quantity_added"
                                    value={formData.quantity_added}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    className="w-full px-4 py-2 border rounded-lg mt-1"
                                />
                            </div>

                            {/* Unit Cost */}
                            <div>
                                <label className="text-sm font-medium">Unit Cost (৳) *</label>
                                <input
                                    type="number"
                                    name="unit_cost"
                                    value={formData.unit_cost}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border rounded-lg mt-1"
                                />
                            </div>
                        </div>

                        {/* Total */}
                        <div className="mt-4 bg-white p-3 rounded border">
                            <div className="flex justify-between">
                                <span>Total Investment:</span>
                                <span className="font-bold text-blue-600">
                                    ৳{totalCost}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Supplier Section */}
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <User size={18} /> Supplier Info
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">

                            <input
                                type="text"
                                name="supplier_name"
                                value={formData.supplier_name}
                                onChange={handleInputChange}
                                placeholder="Supplier name (e.g. ABC Traders)"
                                className="px-4 py-2 border rounded-lg"
                            />

                            <input
                                type="tel"
                                name="supplier_phone"
                                value={formData.supplier_phone}
                                onChange={handleInputChange}
                                placeholder="Phone (e.g. +8801XXXXXXXXX)"
                                className="px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Extra Fields */}
                    <input
                        type="text"
                        name="invoice_number"
                        value={formData.invoice_number}
                        onChange={handleInputChange}
                        placeholder="Invoice number ( 12345 )"
                        className="w-full px-4 py-2 border rounded-lg"
                    />

                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Notes..."
                        rows="3"
                        className="w-full px-4 py-2 border rounded-lg"
                    />

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
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