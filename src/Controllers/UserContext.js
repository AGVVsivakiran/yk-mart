import React, { createContext, useState, useEffect } from 'react';
import Variables from '../Variables.json';

export const UserContext = createContext(null);
export const UserProvider = ({ children }) => {
  // Initialize state from localStorage
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : {};
  });

  const [metaData, setMetaData] = useState({});
  
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem('wishlistItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState("login");

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const baseUrl = Variables.baseUrl;

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [globalCategoryProducts, setGlobalCategoryProducts] = useState({}); // {categoryId: [products]}
  const [loadingProductsGlobal, setLoadingProductsGlobal] = useState({}); // {categoryId: boolean}

  // Fetch categories globally and then load all products in a single shot on mount
  useEffect(() => {
    const loadAppData = async () => {
      let formattedCategories = [];
      try {
        // 1. Fetch Categories
        const response = await fetch(`${baseUrl}/api/Products/GetCategories`);
        const result = await response.json();
        if (Array.isArray(result)) {
          formattedCategories = result.map((item, index) => ({
            id: item.CategoryId || index + 1,
            CategoryId: item.CategoryId || index + 1,
            name: item.CategoryName,
            CategoryName: item.CategoryName,
            image: item.Image,
            Image: item.Image
          }));
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories in context:", error);
      } finally {
        setLoadingCategories(false);
      }

      // 2. Fetch products for all categories in parallel!
      try {
        // Set all category loading states to true initially
        const initialLoadingMap = {};
        formattedCategories.forEach(cat => {
          initialLoadingMap[cat.id] = true;
        });
        setLoadingProductsGlobal(initialLoadingMap);

        const grouped = {};

        await Promise.all(formattedCategories.map(async (cat) => {
          try {
            const formdata = new FormData();
            formdata.append("Param", `[{\"CategoryId\":\"${cat.CategoryId}\"}]`);

            const response = await fetch(`${baseUrl}/api/Products/GetAll_CategorywiseProductsBasedOnCategoryID`, {
              method: 'POST',
              body: formdata
            });
            const catProducts = await response.json();
            grouped[cat.id] = Array.isArray(catProducts) ? catProducts : [];
          } catch (err) {
            console.error(`Error loading products for category ${cat.name || cat.id}:`, err);
            grouped[cat.id] = [];
          }
        }));

        setGlobalCategoryProducts(grouped);
      } catch (error) {
        console.error("Error loading category products catalog:", error);
      } finally {
        // Turn off loading for all categories
        const finalLoadingMap = {};
        formattedCategories.forEach(cat => {
          finalLoadingMap[cat.id] = false;
        });
        setLoadingProductsGlobal(finalLoadingMap);
      }
    };

    loadAppData();
  }, [baseUrl]);

  const fetchProductsForCategoryGlobal = async (categoryId) => {
    // If products for this category are already loaded and exist, do not fetch again!
    if (globalCategoryProducts[categoryId] && globalCategoryProducts[categoryId].length > 0) {
      return globalCategoryProducts[categoryId];
    }

    setLoadingProductsGlobal(prev => ({ ...prev, [categoryId]: true }));
    try {
      const formdata = new FormData();
      formdata.append("Param", `[{\"CategoryId\":\"${categoryId}\"}]`);

      const response = await fetch(`${baseUrl}/api/Products/GetAll_CategorywiseProductsBasedOnCategoryID`, {
        method: "POST",
        body: formdata,
        redirect: "follow"
      });
      const result = await response.json();
      setGlobalCategoryProducts(prev => ({ ...prev, [categoryId]: result }));
      return result;
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId} globally:`, error);
      setGlobalCategoryProducts(prev => ({ ...prev, [categoryId]: [] }));
      return [];
    } finally {
      setLoadingProductsGlobal(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  // Function to load wishlist items
  const loadWishlistItems = async (userId) => {
    try {
      const formData = new FormData();
      formData.append('UserId', userId.toString());

      const response = await fetch(`${baseUrl}/api/Products/GetAllWishListItemsbasedOnUserId`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setWishlistItems(data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  // Function to add item to wishlist
  const addToWishlist = async (product) => {
    // 1. Update local state immediately (Optimistic UI)
    const exists = wishlistItems.some(item => item.Productid === product.Productid);
    if (!exists) {
      setWishlistItems(prev => [...prev, product]);

      // 2. If logged in, save to API
      if (userData.isLoggedIn && userData.id) {
        try {
          const payload = [{
            UserId: userData.id.toString(),
            ProductId: product.Productid.toString(),
            Quantity: "1",
            Price: (product.Price1 || product.Price || "0").toString()
          }];

          const formData = new FormData();
          formData.append('Cartxml', JSON.stringify(payload));

          await fetch(`${baseUrl}/api/Products/Insert_WishList_Items`, {
            method: 'POST',
            body: formData
          });
          // Build a bridge: Fetch again to sync perfectly or just trust the push
          // For now, trusting the push is faster.
        } catch (error) {
          console.error("Error saving wishlist item details to server:", error);
        }
      } else {
        // Not logged in: Show login modal? Or just keep local?
        // Existing behavior is just keep local (until refresh).
        // Ideally we prompt login, but let's stick to current flow + API save if possible.
        setShowAuthModal(true);
        setAuthType("login");
      }
    } else {
      // If it exists, currently we (or the UI) might want to remove it.
      // The previous toggle logic was in the pages.
      // We can handle remove here too if we want a full toggle function.
      removeFromWishlist(product.Productid);
    }
  };

  const removeFromWishlist = async (productId) => {
    // Determine the item to remove
    const itemToRemove = wishlistItems.find(item => item.Productid === productId);

    // Update local state immediately
    setWishlistItems(prev => prev.filter(item => item.Productid !== productId));

    if (itemToRemove && userData.isLoggedIn && userData.id) {
      try {
        // Priority: 'WishlistId', then 'Id' (if distinct from ProductId), else try ProductId?
        // The API requires 'wishListid'.
        // If the fetched item has an 'Id' that is NOT the ProductId, that's likely the WishlistId.
        // Or if it explicitly has 'WishlistId'.
        const wishlistId = itemToRemove.WishlistId || itemToRemove.Id || itemToRemove.wishlistId;

        if (wishlistId) {
          const formData = new FormData();
          formData.append('wishListid', wishlistId.toString());

          await fetch(`${baseUrl}/api/Products/DeleteWishlistItems`, {
            method: 'POST',
            body: formData
          });
        } else {
          console.warn("Could not find WishlistId for deletion:", itemToRemove);
        }
      } catch (error) {
        console.error("Error deleting wishlist item:", error);
      }
    }
  };

  return (
    <UserContext.Provider value={{
      userData, setUserData,
      metaData, setMetaData,
      wishlistItems, setWishlistItems,
      cartItems, setCartItems,
      showAuthModal, setShowAuthModal,
      authType, setAuthType,
      addToWishlist, removeFromWishlist, loadWishlistItems,
      categories, loadingCategories,
      globalCategoryProducts, loadingProductsGlobal, fetchProductsForCategoryGlobal
    }}>
      {children}
    </UserContext.Provider>
  );
};