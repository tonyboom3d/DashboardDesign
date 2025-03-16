import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, X } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { fetchProducts } from '@/api/products';
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
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="products" className="border rounded-lg px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <h3 className="text-lg font-medium text-gray-900">מוצרים מומלצים</h3>
                <div className="text-xs text-gray-500">
                  {settings.recommendedProducts.length} מוצרים נבחרו
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <p className="text-sm text-gray-500 mb-4">בחר מוצרים שיוצעו ללקוחות כשהם קרובים לסף המשלוח החינם.</p>
              
              <div>
                <Label htmlFor="productSuggestion" className="block font-medium text-gray-700 mb-1">שיטת בחירת מוצרים</Label>
                <Select 
                  value={settings.productSuggestionMethod} 
                  onValueChange={handleSuggestionMethodChange}
                >
                  <SelectTrigger id="productSuggestion" className="w-full mb-4">
                    <SelectValue placeholder="בחר שיטה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">בחירה ידנית</SelectItem>
                    <SelectItem value="automatic">אוטומטי (לפי מחיר)</SelectItem>
                    <SelectItem value="bestselling">מוצרים הנמכרים ביותר</SelectItem>
                    <SelectItem value="related">קשורים לפריטים בעגלה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <Input 
                    type="text" 
                    placeholder="חפש מוצרים..."
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
                  <h3 className="text-sm font-medium text-gray-700 mb-2">תוצאות חיפוש</h3>
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
                          הוסף
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Selected Products */}
              <div className="space-y-4">
                {settings.recommendedProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">לא נבחרו מוצרים. חפש והוסף מוצרים למעלה.</p>
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
                הוסף עוד מוצרים
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
