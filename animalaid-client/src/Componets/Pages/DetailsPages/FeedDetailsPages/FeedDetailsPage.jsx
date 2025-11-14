import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { useCart } from '../../../../Context/CartContext.jsx';
import { CheckCircle } from 'lucide-react';

const FeedDetailsPage = () => {
    const { id } = useParams();
    const [feeds, setFeeds] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [reviews, setReviews] = useState([]);
    const [added, setAdded] = useState(false);
    const navigate = useNavigate();
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchFeedDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8000/feeds/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch Feed details');
                }
                const data = await response.json();
                setFeeds(data);
                // Assuming reviews are part of the Feed data
                if (data.reviews) {
                    setReviews(data.reviews);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedDetails();
    }, [id]);

    const handleAddToCart = () => {
        addToCart(feeds, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    // console.log("Feed 85:", feeds)

    // ✅ Fetch reviews on load
    useEffect(() => {
        fetch(`http://localhost:8000/reviews/feeds/${id}/`)
            .then((res) => res.json())
            .then((data) => setReviews(data))
            .catch((err) => console.error('Error fetching reviews:', err));
    }, [id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8000/reviews/feeds/${id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rating: rating,
                    text: review,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setReviews([data, ...reviews]); // Add new review to top
                setRating(0);
                setReview('');
            } else {
                console.error('Failed to submit review');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    if (!feeds) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    Feed not found
                </div>
            </div>
        );
    }

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
        : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 h-80 bg-white rounded-lg shadow-md overflow-hidden">
                    <img
                        src={feeds.image || '/default-Feed.jpg'}
                        alt={feeds.name}
                        className="w-full h-64 object-contain p-4"
                    />
                </div>

                <div className="md:w-2/3">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{feeds.name}</h1>

                    <div className="flex items-center mb-4">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                    key={star}
                                    className={`h-5 w-5 ${star <= averageRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <span className="ml-2 text-gray-600">
                            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="text-3xl font-bold text-blue-600 tracking-tight">
                            ৳ {feeds.price}
                        </div>
                        <div className=" bg-green-100 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full border border-green-300 shadow-sm">
                            In stock: <span className="font-semibold">{feeds.piece}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                        <p className="text-gray-600">{feeds.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Discount</h3>
                            <p className="text-sm text-gray-900">{feeds.discount} %</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Feed Type</h3>
                            <p className="text-sm text-gray-900">{feeds.feed_type}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Brand</h3>
                            <p className="text-sm text-gray-900">{feeds.brand}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Packet Size</h3>
                            <p className="text-sm text-gray-900">{feeds.quantity} {feeds.unit}</p>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button onClick={handleAddToCart} className={`text-sm py-2 px-3 rounded-md transition-colors font-medium ${added ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                            {added ? <span className="flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" /> Added</span> : "Add to Cart"}
                        </button>
                        
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmitReview}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Your Rating</label>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="focus:outline-none"
                                    >
                                        <StarIcon
                                            className={`h-8 w-8 ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="review" className="block text-gray-700 mb-2">Your Review</label>
                            <textarea
                                id="review"
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition duration-300"
                        >
                            Submit Review
                        </button>
                    </form>
                </div>

                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{review.user}</h4>
                                        <div className="flex items-center">
                                            <div className="flex mr-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <StarIcon
                                                        key={star}
                                                        className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-500">{review.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 mt-2">{review.text}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedDetailsPage;