import React from 'react';
import { Heart, Users, Shield, Award, CheckCircle, Target } from 'lucide-react';


const About = () => {
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Trust & Authenticity',
      description: 'We verify every profile to ensure genuine connections and maintain the highest standards of authenticity.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Privacy & Security',
      description: 'Your personal information is protected with advanced security measures and strict privacy controls.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Community Focus',
      description: 'Dedicated to serving the Goud community with cultural understanding and traditional values.',
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Excellence in Service',
      description: 'Committed to providing exceptional matrimonial services with personalized attention to each member.',
    },
  ];

  const stats = [
    { number: '-', label: 'Successful Marriages' },
    { number: '-', label: 'Registered Members' },
    { number: '-', label: 'Years of Excellence' },
    { number: '-', label: 'Cities Covered' },
  ];

  const milestones = [
    { year: '2025', title: 'Founded', description: 'Started with a vision to connect hearts in the community' },
    { year: '2026', title: 'Mobile App Launch', description: '(Coming Soon) Going to launch our first mobile application for easier access' },
    // { year: '2016', title: '10,000 Success Stories', description: 'Celebrated our 10,000th successful marriage' },
    // { year: '2020', title: 'AI Matching', description: 'Introduced advanced AI-powered matching algorithms' },
    // { year: '2023', title: '50,000 Couples', description: 'Reached the milestone of 50,000 happy couples' },
    // { year: '2025', title: 'New Features', description: 'Launching enhanced video profiles and virtual meetings' },
  ];

  return (
    <div className="py-12 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full mb-6">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            About Neelamma Pellipandhiri
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            For over x years, we've been the most trusted name in matrimonial services, 
            connecting hearts and creating beautiful love stories across India.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                To provide a safe, secure, and trusted platform for the Goud community to find their life partners 
                while preserving cultural values and traditions. We believe in the power of meaningful connections 
                and work tirelessly to bring compatible souls together.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-rose-500 mt-0.5" />
                  <span className="text-gray-700">Verified and authentic profiles</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-rose-500 mt-0.5" />
                  <span className="text-gray-700">Advanced privacy and security measures</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-rose-500 mt-0.5" />
                  <span className="text-gray-700">Personalized matchmaking assistance</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-rose-500 mt-0.5" />
                  <span className="text-gray-700">Cultural understanding and respect</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Happy couple"
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl md:text-4xl font-bold text-rose-600 mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Core Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full text-rose-600 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Journey</h2>
            <p className="text-xl text-gray-600">
              Milestones that define our growth and success
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-rose-200 to-pink-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                      <div className="text-2xl font-bold text-rose-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-rose-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-rose-100 max-w-2xl mx-auto">
              Join thousands of happy couples who found their perfect match through our platform. 
              Your love story begins here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-white text-rose-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Register Now
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-rose-600 transition-all duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;