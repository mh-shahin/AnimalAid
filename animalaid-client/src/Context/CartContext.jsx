import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('animalaid_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('animalaid_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);

      // NEW: Stock validation
      const maxStock = product.maxStock || product.piece || 0;

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        // NEW: Prevent exceeding stock
        if (newQuantity > maxStock) {
          alert(`Cannot add more! Maximum available stock is ${maxStock} units.`);
          return prevItems;
        }

        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      // NEW: Check stock for new item
      if (quantity > maxStock) {
        alert(`Cannot add ${quantity} units! Only ${maxStock} available in stock.`);
        return prevItems;
      }

      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Add updateQuantity function with stock validation
  const updateQuantity = (productId, newQuantity) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === productId) {
          const maxStock = item.maxStock || item.piece || 0;

          // Prevent exceeding stock
          if (newQuantity > maxStock) {
            alert(`Maximum available stock is ${maxStock} units!`);
            return item;
          }

          // Remove item if quantity is 0 or less
          if (newQuantity <= 0) {
            return null;
          }

          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean); // Remove null items
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('animalaid_cart');
  };

  const getCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const finalPrice = price - (price * discount / 100);
      return total + (finalPrice * item.quantity);
    }, 0);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCount,
        getTotal,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};