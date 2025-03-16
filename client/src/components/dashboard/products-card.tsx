import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, X } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { fetchProducts } from '@/api/products';
import type { Product } from '@/types/settings';

export const ProductsCard: React.FC = () => {
  const { state, addProduct, removeProduct } = useSettings();
  const { settings } = state;
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle search button click
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    try {
      const products = await fetchProducts(searchTerm);
      setSearchResults(products);
    } catch (error) {
      console.error('Failed to search products:', error);
      toast({
        title: 'Error',
        description: 'Failed to search products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle add product
  const handleAddProduct = (product: Product) => {
    addProduct(product);
    setSearchResults([]);
    setSearchTerm('');
  };
  
  // Handle remove product
  const handleRemoveProduct = (productId: string) => {
    removeProduct(productId);
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recommended Products</h2>
        <p className="text-sm text-gray-500 mb-4">Select products to recommend when customers are close to the free shipping threshold.</p>
        
        <div className="mb-4">
          <div className="flex items-center">
            <Input 
              type="text" 
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="rounded-l-md"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSearch}
              disabled={isSearching}
              className="rounded-l-none"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-4 border border-gray-200 rounded-md p-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {searchResults.map((product) => (
                <div key={product.id} className="flex items-center space-x-3 border border-gray-200 rounded-md p-2 hover:bg-gray-50">
                  <img src={product.imageUrl} alt={product.name} className="h-10 w-10 object-cover rounded-md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500 truncate">${(product.price / 100).toFixed(2)}</p>
                  </div>
                  <Button
                    type="button" 
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddProduct(product)}
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Selected Products */}
        <div className="space-y-4">
          {settings.recommendedProducts.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No products selected. Search and add products above.</p>
          ) : (
            settings.recommendedProducts.map((product) => (
              <div key={product.id} className="relative flex items-center space-x-3 border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                <img src={product.imageUrl} alt={product.name} className="h-16 w-16 object-cover rounded-md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500 truncate">${(product.price / 100).toFixed(2)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveProduct(product.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))
          )}
        </div>
        
        <Button
          type="button" 
          variant="link"
          disabled={isSearching}
          onClick={() => setSearchResults([])} 
          className="mt-4 flex items-center text-sm text-primary-600 hover:text-primary-500 p-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add more products
        </Button>
      </CardContent>
    </Card>
  );
};
