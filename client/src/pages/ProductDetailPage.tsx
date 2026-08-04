import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { useCartStore } from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { ReviewSkeleton, ProductCardSkeleton } from '../components/LoadingSkeleton';
import type { Product, Review, Category } from '../types';

// =====================================================
// ProductDetailPage
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

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/products/${slug}`);
        const productData = response.data.data as Product;
        setProduct(productData);
        if (productData.category && typeof productData.category === 'object') {
          setCategory(productData.category as Category);
        }
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Product not found';
        setError(message);
      } finally {
        setLoading(false);
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
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <ProductCardSkeleton />
            <div className="space-y-4">
              <div className="h-8 bg-[var(--color-surface-2)] rounded-lg w-3/4 animate-pulse" />
              <div className="h-6 bg-[var(--color-surface-2)] rounded-lg w-1/2 animate-pulse" />
              <div className="h-12 bg-[var(--color-surface-2)] rounded-lg w-1/3 animate-pulse" />
              <div className="h-32 bg-[var(--color-surface-2)] rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-[var(--color-text-muted)] mb-6">{error}</p>
          <Link to="/products" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors">
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
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
          <Link to="/products" className="hover:text-white transition-colors">Products</Link>
          {category && (
            <>
              <span>/</span>
              <Link to={`/products?category=${category.slug}`} className="hover:text-white transition-colors">
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-white truncate">{product.name}</span>
        </nav>

        {/* Product Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <img
                src={product.images[selectedImageIndex] || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              {hasDiscount && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-lg shadow-lg">
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
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx ? 'border-indigo-500 shadow-lg' : 'border-[var(--color-border)]'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold font-['Outfit'] mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(product.ratingsAverage)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {product.ratingsAverage.toFixed(1)} ({product.ratingsCount} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-white">₹{effectivePrice.toLocaleString()}</span>
                {hasDiscount && (
                  <span className="text-xl text-[var(--color-text-muted)] line-through mb-1">
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-sm text-green-400 font-medium">
                  You save ₹{(product.price - product.discountPrice!).toLocaleString()} ({discountPercent}% off)
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-[var(--color-border)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-[var(--color-surface-2)] transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-6 py-3 text-center font-semibold min-w-[60px]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-3 hover:bg-[var(--color-surface-2)] transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="p-3.5 border border-[var(--color-border)] rounded-xl hover:border-indigo-500/50 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-3.5 border border-[var(--color-border)] rounded-xl hover:border-indigo-500/50 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--color-border)]">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-6 h-6 text-indigo-400" />
                <span className="text-xs text-[var(--color-text-muted)]">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="w-6 h-6 text-indigo-400" />
                <span className="text-xs text-[var(--color-text-muted)]">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="w-6 h-6 text-indigo-400" />
                <span className="text-xs text-[var(--color-text-muted)]">Easy Returns</span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-6 border-t border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-[var(--color-border)] pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold font-['Outfit']">Customer Reviews</h2>
              <p className="text-[var(--color-text-muted)] mt-1">
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
                <div className="text-center py-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
                  <p className="text-[var(--color-text-muted)]">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                reviews.map((review) => {
                  const reviewUserId = typeof review.user === 'object' ? review.user._id : review.user;
                  const isOwner = isAuthenticated && user?._id === reviewUserId;
                  const isAdmin = user?.role === 'admin';

                  return (
                    <div key={review._id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                            {(typeof review.user === 'object' ? review.user.name : 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {typeof review.user === 'object' ? review.user.name : 'Anonymous'}
                            </p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{review.comment}</p>
                      {(isOwner || isAdmin) && (
                        <button
                          onClick={() => review._id && handleDeleteReview(review._id)}
                          className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors"
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
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sticky top-24">
                  <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Review</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        required
                        minLength={10}
                        maxLength={1000}
                        placeholder="Share your thoughts about this product..."
                        className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 resize-none"
                      />
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">{reviewComment.length}/1000 characters (min 10)</p>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview || reviewComment.length < 10}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 text-center sticky top-24">
                  <p className="text-[var(--color-text-muted)] mb-4">Please log in to write a review</p>
                  <Link
                    to="/login"
                    className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
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
