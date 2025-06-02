import React, { useState, useEffect, useRef } from 'react';
import { Film, Tv, Sparkles, MapPin, Calendar, Globe, Search, Heart, Star, Play, ChevronDown, MessageCircle } from 'lucide-react';

const EntertainmentApp = () => {
  const [mood, setMood] = useState('');
  const [userThoughts, setUserThoughts] = useState('');
  const [region, setRegion] = useState('');
  const [autoRegion, setAutoRegion] = useState('');
  const [language, setLanguage] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [allRecommendations, setAllRecommendations] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [regionLoading, setRegionLoading] = useState(true);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const recommendationsRef = useRef(null);

  const moods = [
    { value: 'happy', label: 'Happy', emoji: '😊', color: 'from-yellow-400 to-orange-400', bgGlow: 'shadow-yellow-200' },
    { value: 'sad', label: 'Sad', emoji: '😢', color: 'from-blue-400 to-cyan-400', bgGlow: 'shadow-blue-200' },
    { value: 'excited', label: 'Excited', emoji: '🤩', color: 'from-purple-400 to-pink-400', bgGlow: 'shadow-purple-200' },
    { value: 'romantic', label: 'Romantic', emoji: '💕', color: 'from-pink-400 to-rose-400', bgGlow: 'shadow-pink-200' },
    { value: 'adventurous', label: 'Adventurous', emoji: '⚡', color: 'from-orange-400 to-red-400', bgGlow: 'shadow-orange-200' },
    { value: 'nostalgic', label: 'Nostalgic', emoji: '🌅', color: 'from-amber-400 to-yellow-400', bgGlow: 'shadow-amber-200' },
    { value: 'mysterious', label: 'Mysterious', emoji: '🔮', color: 'from-indigo-400 to-purple-400', bgGlow: 'shadow-indigo-200' },
    { value: 'chill', label: 'Chill', emoji: '🌙', color: 'from-slate-400 to-gray-400', bgGlow: 'shadow-slate-200' }
  ];


  // Auto-detect region on component mount
  useEffect(() => {
    const detectRegion = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setAutoRegion(data.country_name || 'Unknown');
        setRegion(data.country_name || '');
      } catch (error) {
        console.error('Failed to detect region:', error);
        setAutoRegion('Unknown');
      } finally {
        setRegionLoading(false);
      }
    };
    detectRegion();
  }, []);

  // Floating emoji effect
  const createFloatingEmoji = (emoji, x, y) => {
    const id = Date.now() + Math.random();
    const newEmoji = {
      id,
      emoji,
      x: x - 25,
      y: y - 25,
      opacity: 1,
      scale: 1
    };
    
    setFloatingEmojis(prev => [...prev, newEmoji]);
    
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);
  };

  const handleMoodClick = (moodValue, event) => {
    setMood(moodValue);
    const selectedMood = moods.find(m => m.value === moodValue);
    if (selectedMood) {
      const rect = event.currentTarget.getBoundingClientRect();
      createFloatingEmoji(selectedMood.emoji, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  const scrollToRecommendations = () => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const filterRecommendations = (filterType) => {
    setActiveFilter(filterType);
    if (filterType === 'all') {
      setRecommendations(allRecommendations);
    } else {
      const filtered = allRecommendations.filter(item => {
        const itemType = item.type.toLowerCase();
        switch (filterType) {
          case 'movie':
            return itemType === 'movie';
          case 'series':
            return itemType === 'web series' || itemType === 'series';
          case 'anime':
            return itemType === 'anime';
          default:
            return true;
        }
      });
      setRecommendations(filtered);
    }
  };

  const handleRecommendation = async () => {
    if (!userThoughts.trim()) {
      alert('Please share your thoughts and feelings first!');
      return;
    }

    setLoading(true);
    setShowRecommendations(false);
    
    try {
      const requestData = {
        userThoughts: userThoughts.trim(),
        mood,
        region: region || autoRegion,
        preferences: {
          language: language || 'Any',
          genre: genre || 'Any',
          year: year || 'Any'
        }
      };

      // Call backend API
      const response = await fetch('https://suggestions-production-80b8.up.railway.app/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.recommendations) {
        setAllRecommendations(data.recommendations);
        setRecommendations(data.recommendations);
        setActiveFilter('all');
        setShowRecommendations(true);
        setTimeout(scrollToRecommendations, 500);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      
      // Enhanced fallback data with platforms
      const fallbackRecommendations = [
        {
          title: 'Spirited Away',
          type: 'Anime',
          description: 'A young girl enters a world ruled by gods, witches, and spirits, where humans are changed into beasts.',
          rating: 9.3,
          year: 2001,
          poster: 'https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg',
          reason: 'Perfect for your current mood with magical storytelling',
          platforms: ['Netflix', 'Crunchyroll', 'HBO Max'],
          genre: 'Fantasy',
          language: 'Japanese'
        },
        {
          title: 'The Grand Budapest Hotel',
          type: 'Movie',
          description: 'A writer encounters the owner of an aging high-class hotel, who tells of his early years serving as a lobby boy.',
          rating: 8.1,
          year: 2014,
          poster: 'https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_FMjpg_UX1000_.jpg',
          reason: 'Whimsical and visually stunning, matches your mood perfectly',
          platforms: ['Disney+', 'Amazon Prime', 'Apple TV'],
          genre: 'Comedy',
          language: 'English'
        },
        {
          title: 'Stranger Things',
          type: 'Web Series',
          description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.',
          rating: 8.7,
          year: 2016,
          poster: 'https://m.media-amazon.com/images/M/MV5BN2ZmYjg1YmItNWQ4OC00YWM0LWE0ZDktYThjOTZiZjhhN2Q2XkEyXkFqcGdeQXVyNjgxNTQ3Mjk@._V1_FMjpg_UX1000_.jpg',
          reason: 'Nostalgic 80s vibe with mystery and adventure',
          platforms: ['Netflix'],
          genre: 'Sci-Fi',
          language: 'English'
        },
        {
          title: 'Your Name',
          type: 'Anime',
          description: 'Two teenagers discover they are magically and intermittently swapping bodies.',
          rating: 8.4,
          year: 2016,
          poster: 'https://m.media-amazon.com/images/M/MV5BODRmZDVmNzUtZDA4ZC00NjhkLWI2M2UtN2M0ZDIzNDcxYThjL5BMl5BanBnXkFtZTgwMzExMjE3OTE@._V1_FMjpg_UX1000_.jpg',
          reason: 'Beautiful animation with romantic and mystical elements',
          platforms: ['Funimation', 'Crunchyroll'],
          genre: 'Romance',
          language: 'Japanese'
        },
        {
          title: 'Breaking Bad',
          type: 'Web Series',
          description: 'A high school chemistry teacher turned methamphetamine manufacturer partners with a former student.',
          rating: 9.5,
          year: 2008,
          poster: 'https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjMtNjA5ZDdiYjdiODU5XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg',
          reason: 'Intense drama perfect for deep emotional engagement',
          platforms: ['Netflix', 'Amazon Prime'],
          genre: 'Drama',
          language: 'English'
        },
        {
          title: 'Attack on Titan',
          type: 'Anime',
          description: 'Humanity fights for survival against giant humanoid titans.',
          rating: 9.0,
          year: 2013,
          poster: 'https://m.media-amazon.com/images/M/MV5BNzc5MTczNDQtNDFjNi00ZDU0LTk4Y2EtZWMyZTBhZjBkYWQ0XkEyXkFqcGdeQXVyNTgyNTA4MjM@._V1_FMjpg_UX1000_.jpg',
          reason: 'Action-packed with incredible storytelling',
          platforms: ['Crunchyroll', 'Funimation', 'Hulu'],
          genre: 'Action',
          language: 'Japanese'
        }
      ];
      
      setAllRecommendations(fallbackRecommendations);
      setRecommendations(fallbackRecommendations);
      setActiveFilter('all');
      setShowRecommendations(true);
      setTimeout(scrollToRecommendations, 500);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Movie': return <Film className="w-4 h-4" />;
      case 'Web Series': return <Tv className="w-4 h-4" />;
      case 'Anime': return <Sparkles className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Movie': return 'from-red-400 to-pink-400';
      case 'Web Series': return 'from-green-400 to-emerald-400';
      case 'Anime': return 'from-purple-400 to-violet-400';
      default: return 'from-gray-400 to-slate-400';
    }
  };

  const getPlatformColor = (platform) => {
    const colors = {
      'Netflix': 'bg-red-500 text-white',
      'Crunchyroll': 'bg-orange-500 text-white',
      'Disney+': 'bg-blue-600 text-white',
      'Amazon Prime': 'bg-blue-400 text-white',
      'HBO Max': 'bg-purple-600 text-white',
      'Hulu': 'bg-green-500 text-white',
      'Apple TV': 'bg-gray-800 text-white',
      'Funimation': 'bg-purple-500 text-white'
    };
    return colors[platform] || 'bg-gray-500 text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-pink-400/20 to-orange-400/20 rounded-full animate-pulse delay-1000"></div>
      </div>

      {/* Floating Emojis */}
      {floatingEmojis.map((emoji) => (
        <div
          key={emoji.id}
          className="fixed pointer-events-none z-50 text-4xl animate-ping"
          style={{
            left: emoji.x,
            top: emoji.y,
            animation: 'float 2s ease-out forwards'
          }}
        >
          {emoji.emoji}
        </div>
      ))}

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl shadow-2xl">
              <Sparkles className="w-8 h-8 text-white animate-spin" style={{animationDuration: '3s'}} />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                MoodFlix
              </h1>
              <p className="text-sm text-purple-200 font-medium">✨Entertainment Recommendations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Selection Panel */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 hover:shadow-purple-500/25 transition-all duration-500">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <Heart className="w-8 h-8 mr-4 text-pink-400 animate-bounce" />
            Tell us how you're feeling today!
          </h2>

          {/* User Thoughts Input */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-white mb-4 flex items-center">
              <MessageCircle className="w-6 h-6 mr-3 text-cyan-400" />
              Share your thoughts and feelings 💭
            </label>
            <div className="relative">
              <textarea
                value={userThoughts}
                onChange={(e) => setUserThoughts(e.target.value)}
                placeholder="Tell me how you're feeling... For example: 'I'm happy because of my project progress and want to watch something uplifting' or 'Feeling nostalgic and want to watch something that reminds me of childhood' or 'Had a tough day, need something funny to cheer me up'..."
                className="w-full px-6 py-4 rounded-2xl border-2 border-white/30 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 resize-none h-32 transition-all duration-300 hover:bg-white/15"
                rows="4"
              />
              <div className="absolute bottom-4 right-4 text-white/50 text-sm">
                {userThoughts.length}/500
              </div>
            </div>
            <p className="text-purple-200 text-sm mt-3 flex items-center">
              <span className="mr-2">💡</span>
              The more you share about your mood and preferences, the better recommendations you'll get!
            </p>
          </div>

          {/* Mood Selection - Optional */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-white mb-4">Quick Mood Selection (opt.)✨</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moods.map((moodOption) => (
                <button
                  key={moodOption.value}
                  onClick={(e) => handleMoodClick(moodOption.value, e)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-110 hover:-translate-y-2 group ${
                    mood === moodOption.value
                      ? `bg-gradient-to-r ${moodOption.color} border-white shadow-2xl ${moodOption.bgGlow} text-white scale-105`
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50'
                  }`}
                >
                  <div className="text-4xl mb-3 group-hover:animate-bounce">{moodOption.emoji}</div>
                  <div className="text-sm font-bold">{moodOption.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-white mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-400" />
              Your Region 🌍
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder={regionLoading ? "Detecting..." : autoRegion}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="flex-1 px-6 py-4 rounded-xl border border-white/30 focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
              />
              {regionLoading && (
                <div className="flex items-center px-6 py-4 bg-blue-500/20 rounded-xl backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                  <span className="ml-3 text-sm text-blue-200">Detecting...</span>
                </div>
              )}
            </div>
          </div>

          {/* Optional Preferences */}
<div className="grid md:grid-cols-3 gap-6 mb-8">
  <div>
    <label className="block text-lg font-bold text-white mb-3 flex items-center">
      <Globe className="w-5 h-5 mr-2 text-green-400" />
      Language (opt.)🗣️
    </label>
    <input
      type="text"
      placeholder="Any Language"
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="w-full px-6 py-4 rounded-xl border border-white/30 focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
    />
  </div>
  <div>
    <label className="block text-lg font-bold text-white mb-3 flex items-center">
      <Film className="w-5 h-5 mr-2 text-orange-400" />
      Genre (opt.)🎭
    </label>
    <input
      type="text"
      placeholder="Any Genre"
      value={genre}
      onChange={(e) => setGenre(e.target.value)}
      className="w-full px-6 py-4 rounded-xl border border-white/30 focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
    />
  </div>
  <div>
    <label className="block text-lg font-bold text-white mb-3 flex items-center">
      <Calendar className="w-5 h-5 mr-2 text-purple-400" />
      Year (opt.)📅
    </label>
    <input
      type="number"
      placeholder="Any Year"
      value={year}
      onChange={(e) => setYear(e.target.value)}
      min="1900"
      max="2025"
      className="w-full px-6 py-4 rounded-xl border border-white/30 focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
    />
  </div>
</div>

          {/* Get Recommendations Button */}
          <button
            onClick={handleRecommendation}
            disabled={loading || !userThoughts.trim()}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white py-6 px-8 rounded-2xl font-bold text-xl hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 bg-size-200 animate-gradient"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Finding Perfect Matches...</span>
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                <span>✨ Get My Recommendations ✨</span>
              </>
            )}
          </button>
        </div>

        {/* Scroll Down Arrow */}
        {showRecommendations && (
          <div className="flex justify-center mb-8 animate-bounce">
            <button
              onClick={scrollToRecommendations}
              className="bg-white/20 backdrop-blur-sm p-4 rounded-full text-white hover:bg-white/30 transition-all duration-300"
            >
              <ChevronDown className="w-8 h-8" />
            </button>
          </div>
        )}

        {/* Recommendations */}
        {showRecommendations && recommendations.length > 0 && (
          <div 
            ref={recommendationsRef}
            className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-slideIn"
          >
            <h3 className="text-3xl font-bold text-white mb-8 flex items-center">
              <Star className="w-8 h-8 mr-4 text-yellow-400 animate-pulse" />
              Perfect Matches for You ✨
            </h3>

            {/* Filter Buttons */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => filterRecommendations('all')}
                  className={`px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2 ${
                    activeFilter === 'all'
                      ? 'bg-gradient-to-r from-white to-purple-200 text-purple-800 shadow-xl scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
                  }`}
                >
                  <span>🎬</span>
                  <span>All ({allRecommendations.length})</span>
                </button>
                
                <button
                  onClick={() => filterRecommendations('movie')}
                  className={`px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2 ${
                    activeFilter === 'movie'
                      ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-xl scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>Movies ({allRecommendations.filter(item => item.type.toLowerCase() === 'movie').length})</span>
                </button>
                
                <button
                  onClick={() => filterRecommendations('series')}
                  className={`px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2 ${
                    activeFilter === 'series'
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-xl scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  <span>Series ({allRecommendations.filter(item => item.type.toLowerCase().includes('series') || item.type.toLowerCase() === 'web series').length})</span>
                </button>
                
                <button
                  onClick={() => filterRecommendations('anime')}
                  className={`px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2 ${
                    activeFilter === 'anime'
                      ? 'bg-gradient-to-r from-purple-400 to-violet-400 text-white shadow-xl scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Anime ({allRecommendations.filter(item => item.type.toLowerCase() === 'anime').length})</span>
                </button>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {recommendations.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-white/15 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/20 group"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="flex">
                    <div className="w-40 h-60 flex-shrink-0 relative overflow-hidden">
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x400/8B5CF6/ffffff?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <div className="p-6 flex-1 text-white">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold mb-2 group-hover:text-purple-200 transition-colors">
                            {item.title}</h4>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getTypeColor(item.type)} text-white shadow-lg`}>
                            {getTypeIcon(item.type)}
                            <span className="ml-1">{item.type}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-full mb-2">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-yellow-200 font-bold">{item.rating}</span>
                          </div>
                          <div className="text-purple-200 text-sm font-medium">{item.year}</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                      
                      <div className="mb-4">
                        <div className="text-cyan-200 text-sm font-medium mb-2">💡 Why this matches:</div>
                        <p className="text-purple-200 text-sm italic">{item.reason}</p>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-gray-300 mb-2">Available on:</div>
                        <div className="flex flex-wrap gap-2">
                          {item.platforms && item.platforms.map((platform, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 text-xs font-bold rounded-full ${getPlatformColor(platform)}`}
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-green-300">🎭 {item.genre}</span>
                          <span className="text-blue-300">🗣️ {item.language}</span>
                        </div>
                        <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 hover:scale-105 flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Watch Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recommendations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎭</div>
                <p className="text-white text-xl">No recommendations found for this filter.</p>
                <p className="text-purple-200">Try selecting a different category!</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-purple-200">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-lg font-medium">Made with 💜 for entertainment lovers</p>
          <p className="text-sm mt-2 opacity-75">Powered by G1 • Personalized for you</p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(50px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-slideIn {
          animation: slideIn 0.8s ease-out;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .bg-size-200 {
          background-size: 200% 200%;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default EntertainmentApp;