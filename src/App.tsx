import React, { useState, useEffect } from 'react';
import { Lightbulb, Rocket, Sparkles, AlertCircle } from 'lucide-react';
import OpenAI from 'openai';
import { motion } from 'framer-motion';

interface StartupIdea {
  name: string;
  pitch: string;
}

function generateMockStartupIdea(industry: string, trend: string): StartupIdea {
  const prefixes = ['Smart', 'AI', 'Next-Gen', 'Future', 'Meta', 'Quantum', 'Hyper', 'Ultra'];
  const suffixes = ['Hub', 'Flow', 'Mind', 'Sync', 'Labs', 'Tech', 'Core', 'Matrix'];
  
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  const name = `${randomPrefix}${industry}${randomSuffix}`;
  
  const pitchTemplates = [
    `Revolutionizing the ${industry} industry with ${trend}-powered solutions for the next generation`,
    `Transforming ${industry} through innovative ${trend} technology and machine learning algorithms`,
    `Making ${industry} smarter with cutting-edge ${trend} integration and predictive analytics`,
    `The future of ${industry} powered by advanced ${trend} algorithms and neural networks`,
    `Disrupting ${industry} with state-of-the-art ${trend} and deep learning capabilities`
  ];
  
  const pitch = pitchTemplates[Math.floor(Math.random() * pitchTemplates.length)];
  
  return { name, pitch };
}

function TypeWriter({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{displayText}</span>;
}

function App() {
  const [industry, setIndustry] = useState('');
  const [trend, setTrend] = useState('');
  const [startupIdea, setStartupIdea] = useState<StartupIdea | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showName, setShowName] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedMock, setUsedMock] = useState(false);

  const generateIdea = async (industry: string, trend: string): Promise<StartupIdea> => {
    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a startup idea generator that creates innovative business concepts. Your responses should be creative yet practical, focusing on real-world applications of technology."
          },
          {
            role: "user",
            content: `Generate a creative startup idea and pitch for a company in the ${industry} industry using ${trend} technology. Format the response as a JSON object with two properties:
              1. name: A creative company name that combines ${trend} with ${industry} (should be concise and memorable)
              2. pitch: A one-sentence pitch explaining the company's value proposition
              
              The name should be clever but professional, and the pitch should be compelling and clear.`
          }
        ],
        temperature: 0.8,
      });

      const response = completion.choices[0].message.content || '';
      let parsedResponse;
      
      try {
        parsedResponse = JSON.parse(response);
      } catch (e) {
        const nameMatch = response.match(/\"name\":\s*\"([^\"]+)\"/);
        const pitchMatch = response.match(/\"pitch\":\s*\"([^\"]+)\"/);
        
        parsedResponse = {
          name: nameMatch ? nameMatch[1] : "AI" + industry + "Tech",
          pitch: pitchMatch ? pitchMatch[1] : response.split('\n')[0]
        };
      }

      setUsedMock(false);
      return parsedResponse;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      setUsedMock(true);
      return generateMockStartupIdea(industry, trend);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry || !trend) {
      setError('Please fill in both fields');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setStartupIdea(null);
    setShowName(false);
    setShowPitch(false);
    setUsedMock(false);

    try {
      const idea = await generateIdea(industry, trend);
      setStartupIdea(idea);
      setShowName(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-indigo-900 flex items-center justify-center gap-3">
            <Lightbulb className="w-8 h-8 floating text-yellow-500" />
            Startup Idea Generator
          </h1>
          <p className="mt-3 text-gray-600">Transform your vision into the next big thing</p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit}
          className="glass-morphism card-3d rounded-xl shadow-lg p-8 mb-8"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="space-y-6">
            <motion.div 
              className="transform transition-all duration-300 hover:scale-102"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <input
                type="text"
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50"
                placeholder="e.g., Food, Healthcare, Education"
                required
              />
            </motion.div>

            <motion.div 
              className="transform transition-all duration-300 hover:scale-102"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <label htmlFor="trend" className="block text-sm font-medium text-gray-700 mb-2">
                Trend
              </label>
              <input
                type="text"
                id="trend"
                value={trend}
                onChange={(e) => setTrend(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50"
                placeholder="e.g., AI, Blockchain, IoT"
                required
              />
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isGenerating}
              className={`w-full py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-102 hover:shadow-lg'
              } text-white`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Generate Idea
                </>
              )}
            </motion.button>
          </div>
        </motion.form>

        {startupIdea && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-morphism card-3d rounded-xl shadow-lg p-8 space-y-4"
          >
            <div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500 floating" />
                Your Startup Idea
                {usedMock && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Using Mock Generator
                  </span>
                )}
              </h2>
              <div className="text-xl text-gray-800">
                {showName && (
                  <TypeWriter 
                    text={startupIdea.name} 
                    onComplete={() => setShowPitch(true)}
                  />
                )}
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: showPitch ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="font-semibold text-gray-700 mb-2">Pitch</h3>
              <p className="text-gray-600 italic">
                {showPitch && <TypeWriter text={startupIdea.pitch} />}
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;