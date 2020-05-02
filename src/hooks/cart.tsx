import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { Alert } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import api from 'src/services/api';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const emptyProducts: Product[] = [];
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:cart',
      );
      console.log(storagedProducts);
      setProducts(JSON.parse(storagedProducts) || emptyProducts);
      // await AsyncStorage.clear();
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const ProductAddedId = product.id;

      const productIndex = products.findIndex(
        searchedProduct => searchedProduct.id === ProductAddedId,
      );

      if (productIndex < 0) {
        setProducts([...products, product]);
      } else {
        const updatedProducts = products.map(item => {
          if (item.id === ProductAddedId) {
            item.quantity += 1;
            return item;
          }
          return item;
        });
        setProducts(updatedProducts);
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(
        searchedProduct => searchedProduct.id === id,
      );

      if (productIndex < 0) {
        Alert.alert('Erro', 'Produto não encontrado na cesta');
      } else {
        const updatedProducts = products.map(item => {
          if (item.id === id) {
            item.quantity += 1;
            return item;
          }
          return item;
        });

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
        setProducts(updatedProducts);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(
        searchedProduct => searchedProduct.id === id,
      );

      if (productIndex < 0) {
        Alert.alert('Erro', 'Produto não encontrado na cesta');
      } else if (products[productIndex].quantity > 1) {
        const updatedProducts = products.map(item => {
          if (item.id === id) {
            item.quantity -= 1;

            return item;
          }

          return item;
        });

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
        setProducts(updatedProducts);
      } else {
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
        setProducts(product => products.filter(item => item.id !== id));
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
