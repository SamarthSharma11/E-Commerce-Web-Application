import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingBag, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { useCartStore } from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { ReviewSkeleton, ProductCardSkeleton } from '../components/LoadingSkeleton';
import type { Product, Review, Category } from '../types';

import { FALLBACK_PRODUCTS } from '../data/mockProducts';

// =====================================================
// ProductDetailPage — White Canvas Floating Surfaces
// =====================================================
const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const { user, isAuthenticated } = useAuthStore();

  // Fetch product with fallback
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/products/${slug}`);
        const productData = response.data.data as Product;
        if (productData) {
          setProduct(productData);
          if (productData.category && typeof productData.category === 'object') {
            setCategory(productData.category as Category);
          }
        } else {
          findFallbackProduct();
        }
      } catch (err: unknown) {
        console.warn('Backend unavailable, searching fallback products:', err);
        findFallbackProduct();
      } finally {
        setLoading(false);
      }
    };

    const findFallbackProduct = () => {
      const match = FALLBACK_PRODUCTS.find((p) => p.slug === slug || p._id === slug);
      if (match) {
        setProduct(match);
        if (typeof match.category === 'object' && match.category) {
          setCategory(match.category as Category);
        }
        setError(null);
      } else {
        setError('Product not found');
      }
    };

    fetchProduct();
  }, [slug]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?._id) return;
      setReviewsLoading(true);
      try {
        const response = await api.get(`/products/${product._id}/reviews`);
        setReviews(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [product?._id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    await addToCart(product, quantity);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !isAuthenticated) return;

    setSubmittingReview(true);
    try {
      await api.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review submitted successfully');
      setReviewRating(5);
      setReviewComment('');

      // Refresh reviews
      const response = await api.get(`/products/${product._id}/reviews`);
      setReviews(response.data.data || []);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to submit review';
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted');
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete review';
      toast.error(message);
    }
  };

  const nextImage = () => {
    if (!product) return;
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product) return;
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000]">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProductCardSkeleton />
            <div className="space-y-4">
              <div className="h-8 bg-white rounded-full w-3/4 animate-pulse" />
              <div className="h-6 bg-white rounded-full w-1/2 animate-pulse" />
              <div className="h-12 bg-white rounded-full w-1/3 animate-pulse" />
              <div className="h-32 bg-white rounded-[28px] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-normal tracking-[-0.05em] mb-2">Product Not Found</h2>
          <p className="text-[#787574] mb-6 text-[14px]">{error}</p>
          <Link to="/products" className="px-8 py-3.5 bg-[#000000] text-white rounded-full font-normal text-[14px] transition-opacity hover:opacity-90">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const effectivePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[14px] text-[#787574] mb-6">
          <Link to="/products" className="hover:text-[#000000] transition-colors">Products</Link>
          {category && (
            <>
              <span>/</span>
              <Link to={`/products?category=${category.slug}`} className="hover:text-[#000000] transition-colors">
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#000000] truncate">{product.name}</span>
        </nav>

        {/* Product Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-[28px] overflow-hidden bg-white shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] p-2.5">
              <div className="w-full h-full rounded-[20px] overflow-hidden bg-[#f2f4f5]">
                <img
                  src={product.images[selectedImageIndex] || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#000000] hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#000000] hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </>
              )}
              {hasDiscount && (
                <span className="absolute top-6 left-6 px-3 py-1 bg-[#000000] text-white text-[12px] font-normal rounded-full">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-[20px] overflow-hidden border transition-all cursor-pointer ${
                      selectedImageIndex === idx ? 'border-[#000000] ring-1 ring-[#000000]' : 'border-[#ebebeb]'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Card */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-normal tracking-[-0.05em] text-[#000000] mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.ratingsAverage)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-[#cccccc]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[12px] text-[#787574]">
                  {product.ratingsAverage.toFixed(1)} ({product.ratingsCount} reviews)
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-white rounded-[28px] p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-3xl font-normal text-[#000000] tracking-[-0.031em]">₹{effectivePrice.toLocaleString()}</span>
                {hasDiscount && (
                  <span className="text-xl text-[#787574] line-through mb-1">
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-[12px] text-[#787574]">
                  You save ₹{(product.price - product.discountPrice!).toLocaleString()} ({discountPercent}% off)
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-[#000000]' : 'bg-[#cccccc]'}`} />
              <span className="text-[14px] font-normal text-[#000000]">
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-[#ebebeb] rounded-full overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-[#f2f4f5] transition-colors cursor-pointer"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4 text-[#000000]" />
                </button>
                <span className="px-6 py-2.5 text-center font-normal text-[14px] min-w-[50px]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-3 hover:bg-[#f2f4f5] transition-colors cursor-pointer"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4 text-[#000000]" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-3.5 px-8 bg-[#000000] hover:opacity-90 disabled:bg-[#cccccc] disabled:cursor-not-allowed text-white font-normal text-[14px] rounded-full transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="w-12 h-12 border border-[#ebebeb] rounded-full flex items-center justify-center hover:bg-[#f2f4f5] transition-colors cursor-pointer">
                <Heart className="w-4 h-4 text-[#000000]" />
              </button>
              <button className="w-12 h-12 border border-[#ebebeb] rounded-full flex items-center justify-center hover:bg-[#f2f4f5] transition-colors cursor-pointer">
                <Share2 className="w-4 h-4 text-[#000000]" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#ebebeb]">
              <div className="flex flex-col items-center text-center gap-1.5">
                <Truck className="w-5 h-5 text-[#000000]" />
                <span className="text-[12px] text-[#787574]">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <Shield className="w-5 h-5 text-[#000000]" />
                <span className="text-[12px] text-[#787574]">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <RotateCcw className="w-5 h-5 text-[#000000]" />
                <span className="text-[12px] text-[#787574]">Easy Returns</span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-6 border-t border-[#ebebeb]">
              <h3 className="text-[16px] font-normal mb-3">Description</h3>
              <p className="text-[#787574] text-[14px] leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-[#ebebeb] pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-normal tracking-[-0.05em]">Customer Reviews</h2>
              <p className="text-[#787574] text-[14px] mt-1">
                {product.ratingsCount} review{product.ratingsCount !== 1 ? 's' : ''} • Average rating: {product.ratingsAverage.toFixed(1)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              {reviewsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <ReviewSkeleton key={i} />)
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-[28px] border-none shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
                  <p className="text-[#787574] text-[14px]">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                reviews.map((review) => {
                  const reviewUserId = typeof review.user === 'object' ? review.user._id : review.user;
                  const isOwner = isAuthenticated && user?._id === reviewUserId;
                  const isAdmin = user?.role === 'admin';

                  return (
                    <div key={review._id} className="bg-white rounded-[28px] border-none p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#f2f4f5] flex items-center justify-center text-[#000000] font-normal text-[12px]">
                            {(typeof review.user === 'object' ? review.user.name : 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-normal text-[14px] text-[#000000]">
                              {typeof review.user === 'object' ? review.user.name : 'Anonymous'}
                            </p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-[#cccccc]'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[12px] text-[#787574]">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[14px] text-[#787574] leading-relaxed">{review.comment}</p>
                      {(isOwner || isAdmin) && (
                        <button
                          onClick={() => review._id && handleDeleteReview(review._id)}
                          className="mt-3 text-[12px] text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          Delete Review
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Review Form */}
            <div className="lg:col-span-1">
              {isAuthenticated ? (
                <div className="bg-white rounded-[28px] border-none p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] sticky top-6">
                  <h3 className="text-[16px] font-normal mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Rating</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-[#cccccc]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Your Review</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        required
                        minLength={10}
                        maxLength={1000}
                        placeholder="Share your thoughts about this product..."
                        className="w-full px-4 py-3 bg-white border border-[#ebebeb] rounded-[20px] text-[14px] text-[#000000] placeholder-[#787574] focus:outline-none resize-none"
                      />
                      <p className="text-[12px] text-[#787574] mt-1">{reviewComment.length}/1000 characters (min 10)</p>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview || reviewComment.length < 10}
                      className="w-full py-3 bg-[#000000] hover:opacity-90 disabled:bg-[#cccccc] disabled:cursor-not-allowed text-white font-normal text-[14px] rounded-full transition-opacity cursor-pointer"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-[28px] border-none p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] text-center sticky top-6">
                  <p className="text-[#787574] text-[14px] mb-4">Please log in to write a review</p>
                  <Link
                    to="/login"
                    className="inline-block px-8 py-3.5 bg-[#000000] hover:opacity-90 text-white text-[14px] font-normal rounded-full transition-opacity"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
