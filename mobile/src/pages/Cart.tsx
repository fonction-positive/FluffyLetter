import { useState, useEffect } from "react";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";

interface ProductImage {
  id: number;
  image: string;
  is_main: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  main_image?: ProductImage;
  color?: string;
  size?: string;
}

interface CartItem {
  id: number;
  product: number;
  product_detail: Product;
  quantity: number;
  subtotal: string;
}

interface CartData {
  id: number;
  items: CartItem[];
  total_count: number;
  total_price: string;
}

const Cart = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check login status and fetch cart
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    if (token) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get('cart/');
      setCart(response.data);
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
      setError("加载购物车失败");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await removeItem(itemId);
        return;
      }

      await api.put(`cart/update_item/${itemId}/`, { quantity: newQuantity });
      await fetchCart(); // Refresh cart
    } catch (err: any) {
      console.error('Failed to update quantity:', err);
      const errorMsg = err.response?.data?.error || "更新失败";
      setError(errorMsg);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await api.delete(`cart/remove_item/${itemId}/`);
      await fetchCart(); // Refresh cart
    } catch (err: any) {
      console.error('Failed to remove item:', err);
      setError("删除失败");
    }
  };

  const shipping = 10;
  const subtotal = parseFloat(cart?.total_price || '0');
  const total = subtotal + (cart && cart.items.length > 0 ? shipping : 0);

  // Guest state - not logged in
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
        </div>

        {/* Empty Cart - Guest State */}
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-center">未登录</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-sm">
            登录后即可查看购物车
          </p>
          <Link to="/login" className="w-full max-w-xs">
            <Button className="w-full h-14 rounded-full text-base font-bold">
              注册登录
            </Button>
          </Link>
          <Link to="/register" className="mt-4">
            <Button variant="ghost" className="text-sm">
              还没有账户？立即注册
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 h-full overflow-y-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
        </div>
        <div className="flex justify-center items-center py-16">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !cart) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 h-full overflow-y-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchCart}>重试</Button>
        </div>
      </div>
    );
  }

  // Logged in state - show cart
  return (
    <div className="max-w-md mx-auto px-4 py-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
      </div>

      {!cart || cart.items.length === 0 ? (
        /* Empty Cart - Logged in */
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-center">购物车是空的</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-sm">
            快去挑选您喜欢的商品吧
          </p>
          <Link to="/products" className="w-full max-w-xs">
            <Button className="w-full h-14 rounded-full text-base font-bold">
              开始购物
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cart.items.map((item) => (
              <Card key={item.id} className="p-4 rounded-2xl">
                <div className="flex gap-4">
                  <img
                    src={item.product_detail.main_image?.image || "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=400&fit=crop"}
                    alt={item.product_detail.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-sm">{item.product_detail.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {item.product_detail.color && `Color: ${item.product_detail.color}`}
                          {item.product_detail.color && item.product_detail.size && " • "}
                          {item.product_detail.size && `Size: ${item.product_detail.size}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-lg">¥{item.product_detail.price}</p>
                      <div className="flex items-center gap-2 bg-muted rounded-full px-2 py-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-semibold text-sm w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <Card className="p-6 rounded-2xl mb-6">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">¥{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold">¥{shipping}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl">¥{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Checkout Button */}
          <Button className="w-full h-14 rounded-full text-base font-bold" size="lg">
            Proceed to Checkout
          </Button>
        </>
      )}
    </div>
  );
};

export default Cart;
