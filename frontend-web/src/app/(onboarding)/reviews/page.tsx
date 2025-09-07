'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Marketing Manager',
    industry: 'Marketing',
    text: 'I froze in 3 real interviews. After 6 mocks, I landed an offer at a top tech company.',
    rating: 5,
    profilePicture: 'https://media.istockphoto.com/id/1478440723/photo/black-woman-arms-crossed-and-standing-in-confidence-with-vision-isolated-against-a-gray.jpg?s=612x612&w=0&k=20&c=cd4SdG1qNIxP9potasQ1jfzD9VbSbdkCqOtQtBmIT_0='
  },
  {
    name: 'David Chen',
    role: 'Software Engineer',
    industry: 'Technology',
    text: 'The AI feedback was spot-on. Helped me identify blind spots I never knew I had.',
    rating: 5,
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format'
  },
  {
    name: 'Jennifer L.',
    role: 'Sales Director',
    industry: 'Sales',
    text: 'Went from nervous wreck to confident closer. 9x improvement is no joke!',
    rating: 4.5,
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format'
  }
];

export default function Reviews() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleContinue = () => {
    router.push('/demo-interview');
  };

  const handleBack = () => {
    router.back();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`star-full-${i}`} className="text-brand-primary text-lg">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="star-half" className="text-brand-primary text-lg">☆</span>
      );
    }

    const totalStars = hasHalfStar ? fullStars + 1 : fullStars;
    for (let i = totalStars; i < 5; i++) {
      stars.push(
        <span key={`star-outline-${i}`} className="text-gray-600 text-lg">☆</span>
      );
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <button onClick={handleBack} className="text-gray-400 hover:text-white">
              ← Back
            </button>
            <span className="text-gray-400 text-sm">Step 5 of 7</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-brand-primary h-2 rounded-full" style={{ width: '71%' }}></div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Join thousands who got hired</h1>
          
          <div className="flex items-center justify-center mb-4 space-x-2">
            <div className="flex -space-x-2">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format"
                alt="User"
                className="w-8 h-8 rounded-full border-2 border-brand-primary"
              />
              <img 
                src="https://www.elitesingles.co.uk/wp-content/uploads/sites/59/2019/11/elite_singles_slide_6-350x264.png"
                alt="User"
                className="w-8 h-8 rounded-full border-2 border-brand-primary"
              />
              <img 
                src="https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWFsZXxlbnwwfHwwfHx8MA%3D%3D"
                alt="User"
                className="w-8 h-8 rounded-full border-2 border-brand-primary"
              />
            </div>
            <span className="text-gray-300">
              <span className="text-brand-primary font-bold">10,000+</span> success stories • <span className="text-brand-primary font-bold">87%</span> get offers
            </span>
          </div>
          
          <p className="text-gray-300">Real results from people just like you</p>
        </div>

        {/* Testimonial Carousel */}
        <div className="mb-8">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {renderStars(testimonials[currentIndex].rating)}
              </div>
              <span className="text-gray-400 text-2xl">💬</span>
            </div>
            
            <p className="text-white mb-4 leading-relaxed">
              {testimonials[currentIndex].text}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={testimonials[currentIndex].profilePicture}
                  alt={testimonials[currentIndex].name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-white font-medium">{testimonials[currentIndex].name}</p>
                  <p className="text-gray-400 text-sm">{testimonials[currentIndex].role}</p>
                </div>
              </div>
              <div className="bg-brand-primary/20 border border-brand-primary rounded-full px-3 py-1">
                <span className="text-brand-primary text-sm font-medium">
                  {testimonials[currentIndex].industry}
                </span>
              </div>
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center mt-4 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-brand-primary' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8 bg-green-900/20 border border-green-700 rounded-lg p-3">
          <span className="text-green-400 text-lg">🛡️</span>
          <span className="text-green-300 text-sm">Trusted by professionals worldwide</span>
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-3 px-4 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>Get Started</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}