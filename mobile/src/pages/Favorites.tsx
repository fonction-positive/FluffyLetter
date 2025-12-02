import { useState, useEffect } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import api from "@/lib/api";

interface ProductImage {
  id: number;
  image: string;
  is_main: boolean;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  color?: string;
  size?: string;
  main_image?: ProductImage;
}

const Favorites = () => {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // Load favorite IDs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        setFavoriteIds(ids);
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
  }, []);

  // Fetch favorite products
  useEffect(() => {
    const fetchFavorites = async () => {
      if (favoriteIds.length === 0) {
        setLoading(false);
        setFavoriteProducts([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch all products and filter by favorite IDs
        const response = await api.get('products/');
        const allProducts = response.data;
        // Filter products by favorite IDs and maintain order
        const favorites = favoriteIds
          .map(id => allProducts.find((p: Product) => p.id === id))
          .filter((p): p is Product => p !== undefined);
        setFavoriteProducts(favorites);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
        setFavoriteProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favoriteIds]);

  // Toggle favorite
  const toggleFavorite = (productId: number) => {
    const newFavoriteIds = favoriteIds.filter(id => id !== productId);
    setFavoriteIds(newFavoriteIds);
    localStorage.setItem('favorites', JSON.stringify(newFavoriteIds));

    // Remove from displayed products
    setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 h-full overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Favorites</h1>
        <div className="flex justify-center items-center py-16">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8">Favorites</h1>

      {favoriteProducts.length === 0 ? (
        /* Empty Favorites */
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6">
            <Heart className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-center">暂无收藏</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-sm">
            快去收藏您喜欢的商品吧
          </p>
          <Link to="/products" className="w-full max-w-xs">
            <Button className="w-full h-14 rounded-full text-base font-bold">
              <ShoppingBag className="h-5 w-5 mr-2" />
              开始购物
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {favoriteProducts.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`}>
              <Card className="rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform">
                <div className="relative">
                  <img
                    src={product.main_image?.image || "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=400&fit=crop"}
                    alt={product.name}
                    className="w-full aspect-square object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-3 right-3 h-10 w-10 rounded-full bg-card/90 hover:bg-card"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(product.id);
                    }}
                  >
                    <Heart className="h-5 w-5 fill-[rgb(255,107,107)] text-[rgb(255,107,107)]" />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {product.description || (product.color ? `Color - ${product.color}` : "")}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">¥{product.price}</p>
                    {product.original_price && product.original_price > product.price && (
                      <p className="text-xs text-muted-foreground line-through">
                        ¥{product.original_price}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
