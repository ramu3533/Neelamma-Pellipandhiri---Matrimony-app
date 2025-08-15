import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Calendar, MapPin, Star, Quote } from 'lucide-react';

// Define an interface for the success story object for type safety
interface Story {
  story_id: number;
  names: string;
  location: string;
  marriage_date: string;
  story: string;
  image: string;
  testimonial: string;
}

const SuccessStories = () => {
  // Use the Story interface to strongly type the state array
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const fetchSuccessStories = async () => {
      try {
        const res = await axios.get<Story[]>(`${import.meta.env.VITE_API_BASE_URL}/api/success-stories`);
        setStories(res.data);
      } catch (error) {
        console.error('Error fetching success stories:', error);
      }
    };
    fetchSuccessStories();
  }, []);

  const statistics = [
    { number: '-', label: 'Happy Couples', icon: <Heart className="h-8 w-8" /> },
    { number: '-', label: 'Success Rate', icon: <Star className="h-8 w-8" /> },
    { number: '-', label: 'Years Experience', icon: <Calendar className="h-8 w-8" /> },
    { number: '-', label: 'Cities Covered', icon: <MapPin className="h-8 w-8" /> },
  ];

  return (
    <div className="py-12 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full mb-6">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Success Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real love stories from real couples who found their perfect match. 
            Their journey to happiness started here, and yours can too.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {statistics.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full text-rose-600 mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-rose-600 mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Success Stories Grid */}
        <div className="space-y-12">
          {stories.map((story, index) => (
            <div
              key={story.story_id}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } flex flex-col lg:flex`}
            >
              <div className="lg:w-1/2">
                <img
                  src={story.image}
                  alt={story.names}
                  className="w-full h-64 lg:h-full object-cover"
                />
              </div>
              <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">{story.names}</h3>
                      <div className="flex items-center space-x-4 text-gray-600 mt-2">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{story.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="text-sm">Married {story.marriage_date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed text-lg">{story.story}</p>

                  <div className="relative">
                    <Quote className="h-8 w-8 text-rose-200 absolute -top-2 -left-2" />
                    <blockquote className="text-rose-700 font-medium italic text-lg pl-6">
                      {story.testimonial}
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Your Love Story Awaits
            </h2>
            <p className="text-xl text-rose-100 max-w-3xl mx-auto">
              Join thousands of happy couples who found their perfect match through our platform. 
              Every love story is unique, and we're here to help you write yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-white text-rose-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Your Journey
              </a>
              <a
                href="/profiles"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-rose-600 transition-all duration-300"
              >
                Browse Profiles
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
