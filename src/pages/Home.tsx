import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Shield, Star, Search, UserCheck, ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Verified Profiles',
      description: 'All profiles are manually verified to ensure authenticity and safety.',
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Perfect Matches',
      description: 'Advanced matching algorithm to find your ideal life partner.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Privacy Protected',
      description: 'Your personal information is secure with our advanced privacy controls.',
    },
    {
      icon: <UserCheck className="h-8 w-8" />,
      title: 'Personal Assistance',
      description: 'Dedicated relationship managers to guide you throughout your journey.',
    },
  ];

  const stats = [
    { number: '-', label: 'Happy Couples' },
    { number: '-', label: 'Verified Profiles' },
    { number: '-', label: 'Years Experience' },
    { number: '-', label: 'Success Rate' },
  ];

  const testimonials = [
    {
      name: 'Priya & Raj',
      location: 'Hyderabad',
      text: 'We found each other through Goud\'s Matrimony and couldn\'t be happier. The platform made our search so much easier!',
      image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Anitha & Suresh',
      location: 'Bangalore',
      text: 'Thanks to the excellent matching system, we found our perfect match within 3 months. Highly recommended!',
      image: 'https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  return (
    <div className="overflow-hidden">
      <section className="relative bg-gradient-to-br from-red-200 via-pink-200 to-red-200 py-20 lg:py-32">
        <div className="absolute inset-0 bg-white/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Find Your
                  <span className="block bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    Perfect Match
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Trusted matrimony service. Join thousands of families 
                  who found their happiness through our platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-center group"
                >
                  Register Free
                  <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link
                  to="/profiles"
                  className="border-2 border-rose-500 text-rose-600 px-8 py-4 rounded-full font-semibold hover:bg-rose-500 hover:text-white transition-all duration-300 text-center"
                >
                  Browse Profiles
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-rose-600">{stat.number}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://t3.ftcdn.net/jpg/07/10/27/26/360_F_710272660_KfGGCPt1p7MGSEyVF9awam6zmt6TIUd0.jpg"
                  alt="Happy couple"
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-gradient-to-br from-purple-200 to-rose-200 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Choose Neelamma Pellipandhiri?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a safe, secure, and personalized platform to help you find your life partner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center space-y-4 p-6 rounded-xl hover:shadow-lg transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full text-rose-600 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our happy couples who found love through our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/success-stories"
              className="inline-flex items-center text-rose-600 font-semibold hover:text-rose-700 transition-colors duration-200"
            >
              View More Success Stories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Find Your Life Partner?
            </h2>
            <p className="text-xl text-rose-100 leading-relaxed">
              Join thousands of happy couples who found their perfect match through our platform. 
              Start your journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-rose-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Create Profile Now
              </Link>
              <Link
                to="/profiles"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-rose-600 transition-all duration-300"
              >
                Browse Profiles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;