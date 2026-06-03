import { ProductCard } from "./ProductCard";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getProduct = (item) =>
  item?.product && typeof item.product === "object" ? item.product : null;

export const ProductSlider = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/cart`, { withCredentials: true });
        if (res.data && Array.isArray(res.data.items)) {
          setCartItems(res.data.items.filter((item) => getProduct(item)));
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error("Error fetching cart items:", err);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) return <p className="text-center py-6">Loading cart...</p>;

  // Show empty message if no items
  if (cartItems.length === 0) {
    return (
      <div className="w-full max-w-5xl mb-8 p-6 bg-white rounded-2xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Cart</h2>
        <p className="text-gray-500">Your Cart is Empty</p>
      </div>
    );
  }

  const totalPrice = cartItems.reduce(
    (total, item) => {
      const product = getProduct(item);
      return total + (product.new_price || product.price || 0) * item.quantity;
    },
    0
  );

  // Keep 4 slots, fill empty slots with null
  const displayedItems = [...cartItems];
  while (displayedItems.length < 4) {
    displayedItems.push(null);
  }

  return (
    <div className="w-full max-w-5xl mb-8">
      <div className="p-6 bg-white rounded-2xl shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Cart</h2>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
              {cartItems.length} items
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
              ₹{totalPrice}
            </span>
          </div>
        </div>

        {/* Slider */}
        <Link to="/cart">
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide object-contain">
            {displayedItems.map((item, index) =>
              item ? (
                (() => {
                  const product = getProduct(item);

                  return (
                    <ProductCard
                      key={item._id}
                      image={product.images?.[0]?.url || "/placeholder.png"}
                      title={product.name}
                      price={product.new_price || product.price}
                      originalPrice={product.old_price || product.price}
                      discount={product.offer_line?.replace("%", "") || 0}
                      imgClass="h-30 w-40 object-fit" // fixed size
                    />
                  );
                })()
              ) : (
                <div key={`empty-${index}`} className="w-48 h-48 flex-shrink-0"></div>
              )
            )}
          </div>
        </Link>

        {/* "+X more" if more than 4 real items */}
        {cartItems.length > 4 && (
          <p className="text-sm text-gray-500 mt-2">
            +{cartItems.length - 4} more item(s)
          </p>
        )}
      </div>
    </div>
  );
};
