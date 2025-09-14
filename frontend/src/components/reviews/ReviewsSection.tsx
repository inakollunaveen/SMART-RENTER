import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, ThumbsUp } from 'lucide-react';

// Mock reviews data
const mockReviews = [
  {
    id: "1",
    user: "Priya S.",
    rating: 5,
    date: "2024-01-15",
    comment: "Excellent property with all modern amenities. The owner is very cooperative and responsive. Highly recommended for working professionals.",
    helpful: 12
  },
  {
    id: "2",
    user: "Rahul M.",
    rating: 4,
    date: "2024-01-10",
    comment: "Good location and well-maintained apartment. Close to metro station which makes commuting easy. Only minor issue was with parking space.",
    helpful: 8
  },
  {
    id: "3",
    user: "Anjali K.",
    rating: 5,
    date: "2024-01-05",
    comment: "Loved the spacious rooms and the neighborhood is very safe. The owner was very helpful during the move-in process.",
    helpful: 15
  }
];

const ReviewsSection = () => {
  const averageRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reviews & Ratings</span>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <Badge variant="secondary">{averageRating.toFixed(1)}</Badge>
            <span className="text-sm text-muted-foreground">({mockReviews.length} reviews)</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/30 rounded-lg">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = mockReviews.filter(r => r.rating === stars).length;
            const percentage = (count / mockReviews.length) * 100;
            
            return (
              <div key={stars} className="flex items-center space-x-2">
                <span className="text-sm font-medium">{stars}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
        
        {/* Individual Reviews */}
        <div className="space-y-4">
          {mockReviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
              <div className="flex items-start space-x-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {review.user.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{review.user}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewsSection;