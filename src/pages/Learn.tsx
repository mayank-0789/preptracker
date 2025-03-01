import React, { useState, useEffect, useMemo } from 'react';
import { Search, Play } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeId: string;
  duration: string;
  chapter: string;
  subject: string;
}

interface SubjectData {
  [key: string]: {
    chapters: string[];
    videos: Video[];
  };
}

const defaultChapters: { [key: string]: string[] } = {
  'Physics': [
    'Basic Mathematics',
    'Units and Measurements',
    'Motion in a Straight Line',
    'Motion in a Plane',
    'Laws of Motion',
    'Work, Energy and Power',
    'System of Particles',
    'Rotation Motion',
    'Gravitation',
    'Mechanical Properties of Solid',
    'Mechanical Properties of Fluids',
    'Thermal Properties of Matter',
    'Thermodynamics',
    'Kinetic Theory of Gases',
    'Oscillations',
    'Waves',
    'Electrostatic',
    'Capacitance',
    'Current Electricity',
    'Moving Charges & Magnetism',
    'Magnetism & Matter',
    'EMI',
    'Alternating Current',
    'Electromagnetic Waves',
    'Ray optics',
    'Wave Optics',
    'Dual Nature of Radiation and Matter',
    'Atoms',
    'Nuclei',
    'Semiconductor'

  ],

  'Chemistry': [
    'Some Basic Concept of Chemistry',
    'Structure of Atom',
    'Classification of Elements & Periodicity',
    'Chemical Bonding',
    'Thermodynamics',
    'Chemical Equilibrium',
    'Ionic Equilibrium',
    'Redox Reactions',
    'p-Block Elements (Group 13 & 14)',
    'Organic Chemistry: Some Basic Principles & Techniques',
    'Hydrocarbons',
    'Solutions',
    'Electrochemistry',
    'Chemical Kinetics',
    'p-Block Elements (Group 15,16,17,18)',
    'd & f-Block Elements',
    'Coordination Compounds',
    'Haloalkanes & Haloarenes',
    'Alcohol, Phenol and Ether',
    'Aldehyde and Ketone',
    'Carboxylic Acid',
    'Amines',
    'Biomolecules',
    'Practical Chemistry'
  ],

  'Biology': [
    'Living World',
    'Biological Classification',
    'Plant Kingdom',
    'Animal Kingdom',
    'Morphology of Flowering Plants',
    'Anatomy of Flowering Plants',
    'Structural Organisation in Animals',
    'Cell-The Unit of Life',
    'Biomolecules',
    'Cell Cycle and Cell Division',
    'Photosynthesis in Higher Plants',
    'Respiration in Plants',
    'Plant Growth and Development',
    'Breathing and Exchange of Gases',
    'Body Fluids and Circulation',
    'Excretory Products & their elimination',
    'Locomotion and movements',
    'Neural Control and Coordination',
    'Chemical Coordination and Integration',
    'Sexual Reproduction in Flowering Plants',
    'Human Reproduction',
    'Reproductive Health',
    'Principles of Inheritance and Variation',
    'Molecular Basis of Inheritance',
    'Evolution',
    'Human Health & Diseases',
    'Microbes in human Welfare',
    'Biotechnology-Principles and Processes',
    'Biotechnology and Its Application',
    'Organism and Populations',
    'Ecosystem',
    'Biodiversity and Conservation'
    
  ]
};

const Learn = () => {
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const videosCollection = collection(db, 'videos');
      const videoSnapshot = await getDocs(videosCollection);
      const videoList = videoSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Video[];
      setVideos(videoList);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const subjectData = useMemo(() => {
    const data: SubjectData = {};
    
    // Initialize with default subjects even if there are no videos
    Object.keys(defaultChapters).forEach(subject => {
      data[subject] = {
        chapters: defaultChapters[subject],
        videos: videos.filter(video => video.subject === subject)
      };
    });

    // Add any additional subjects from videos
    videos.forEach(video => {
      if (!data[video.subject]) {
        data[video.subject] = {
          chapters: [],
          videos: videos.filter(v => v.subject === video.subject)
        };
      }
    });

    return data;
  }, [videos]);

  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const matchesSubject = video.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchesChapter = !selectedChapter || video.chapter.toLowerCase() === selectedChapter.toLowerCase();
      const matchesSearch = !searchQuery || 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        video.chapter.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubject && matchesChapter && matchesSearch;
    });
  }, [videos, selectedSubject, selectedChapter, searchQuery]);

  const handleVideoClick = (youtubeId: string) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Fixed header section */}
      <div className="flex flex-col space-y-4 bg-gray-50 z-10 px-2 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pt-2">
          <h1 className="text-2xl font-bold text-gray-800 pl-10 md:pl-0">Learning Center</h1>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search videos..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full md:w-[300px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex overflow-x-auto pb-2 border-b sticky top-0 bg-gray-50 pl-10 md:pl-0">
          {Object.keys(subjectData).length > 0 ? (
            Object.keys(subjectData).map((subject) => (
              <button
                key={subject}
                onClick={() => {
                  setSelectedSubject(subject);
                  setSelectedChapter(null);
                }}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  selectedSubject === subject
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {subject}
              </button>
            ))
          ) : (
            <div className="text-gray-500">Loading subjects...</div>
          )}
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 overflow-hidden mt-4 px-2 md:px-0">
        {/* Sidebar - fixed on desktop, dropdown on mobile */}
        <div className="md:w-64 md:space-y-2 md:flex-shrink-0 pl-10 md:pl-0">
          <h2 className="font-semibold text-gray-700 mb-2 md:mb-4">Chapters</h2>
          <div className="space-y-1">
            {subjectData[selectedSubject] && (
              <select
                value={selectedChapter || ''}
                onChange={(e) => setSelectedChapter(e.target.value || null)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Chapters</option>
                {subjectData[selectedSubject].chapters.map((chapter) => (
                  <option key={chapter} value={chapter}>
                    {chapter}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Scrollable video grid */}
        <div className="flex-1 overflow-y-auto pr-2 md:pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-8 text-gray-500">
                Loading videos...
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No videos found
              </div>
            ) : (
              filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleVideoClick(video.youtubeId)}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{video.chapter}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
