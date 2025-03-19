import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, X } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types/settings';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export const ProductsCard: React.FC = () => {
  const { state, addProduct, removeProduct, updateSettings } = useSettings();
  const { settings } = state;
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle search term change
  const handleSearchTermChange = async (term: string) => {
    console.log('[Products Search] Search term changed:', term);
    setSearchTerm(term);
  };

  // Fetch products when component mounts
  useEffect(() => {
    console.log('[Products Card] Initial products fetch');
    const initialFetch = async () => {
      setIsSearching(true);
      try {
        const products = await fetchWixProducts('');
        console.log('[Products Card] Initial products loaded:', products);
        setSearchResults(products);
      } catch (error) {
        console.error('[Products Card] Error loading initial products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive'
        });
      } finally {
        setIsSearching(false);
      }
    };
    initialFetch();
  }, []);

  // Handle product suggestion method change
  const handleSuggestionMethodChange = (value: string) => {
    updateSettings({ 
      productSuggestionMethod: value as 'manual' | 'automatic' | 'bestselling' | 'related' 
    });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchWixProducts = async (searchQuery: string = "") => {
    try {
      const params = new URLSearchParams({
        instanceId: settings.instanceId,
        limit: "100",
        filter: searchQuery
      });

      const response = await fetch(`/api/wix-products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      return data.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.priceData?.price || 0,
        discountedPrice: product.priceData?.discountedPrice,
        imageUrl: product.media?.mainMedia?.image?.url || 
                 'https://via.placeholder.com/100',
        inStock: product.stock?.inStock || false
      }));
    } catch (error) {
      console.error('Error fetching Wix products:', error);
      return [];
    }
  };

  // Handle search button click
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    console.log('[Products Card] Starting product search with query:', searchTerm); // Added log
    setIsSearching(true);
    try {
      const products = await fetchWixProducts(searchTerm);
      console.log('[Products Card] Search results:', products); // Added log
      setSearchResults(products);
    } catch (error) {
      console.error('[Products Card] Error searching products:', error); // Added log
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
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="products" className="border rounded-lg px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <h3 className="text-lg font-medium text-gray-900">Recommended Products</h3>
                <div className="text-xs text-gray-500">
                  {settings.recommendedProducts.length} products selected
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pt-2 pb-4 space-y-4">
              <p className="text-sm text-gray-500 mb-4">Choose products to offer your customers when they're close to the free shipping threshold.</p>

              <div>
                <Label htmlFor="productSuggestion" className="block font-medium text-gray-700 mb-1">Product Selection Method</Label>
                <Select 
                  value={settings.productSuggestionMethod} 
                  onValueChange={handleSuggestionMethodChange}
                >
                  <SelectTrigger id="productSuggestion" className="w-full mb-4">
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Selection</SelectItem>
                    <SelectItem value="automatic">Automatic (by price)</SelectItem>
                    <SelectItem value="bestselling">Best Selling Products</SelectItem>
                    <SelectItem value="related">Related to Cart Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                          <p className="text-sm text-gray-500 truncate">
                            {settings.currencySymbol || '$'}{(product.price / 100).toFixed(2)}
                            {product.discountedPrice && ` (${settings.currencySymbol || '$'}{(product.discountedPrice / 100).toFixed(2)})`}
                          </p>
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
                        <p className="text-sm text-gray-500 truncate">{settings.currencySymbol || '$'}{(product.price / 100).toFixed(2)}</p>
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
                Add More Products
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};