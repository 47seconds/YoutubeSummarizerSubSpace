import React, { useState, useEffect } from 'react';
import { useAuthenticationStatus, useSignOut, useUserData } from '@nhost/react';
import { useNavigate } from 'react-router-dom';
import { Youtube, LogOut } from 'lucide-react';
import { ErrorMessage } from './ErrorMessage';
import { nhost } from '../lib/nhost';
import { SummaryDisplay } from './SummaryDisplay';
import axios from 'axios';

export function VideoSummary() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]); // Store the fetched history here
  const { isAuthenticated } = useAuthenticationStatus();
  const { signOut } = useSignOut();
  const navigate = useNavigate();
  const user = useUserData();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const saveSummary = async (youtubeUrl: string, summaryContent: string, title: string) => {
    if (!user) {
      setError('User not found. Please login again.');
      return;
    }
  
    try {
      const res = await nhost.graphql.request(`
        mutation insertSummary($youtube_url: String!, $summary_content: String!, $user_id: uuid!, $title: String!) {
          insert_summaries_one(object: {
            youtube_url: $youtube_url,
            summary_content: $summary_content,
            user_id: $user_id,
            title: $title
          }) {
            summary_id
          }
        }
      `, {
        youtube_url: youtubeUrl,
        summary_content: summaryContent,
        user_id: user.id,
        title: title
      });
      console.log(res);
    } catch (err) {
      console.error('Failed to save summary:', err);
      setError('Failed to save summary. Please try again.');
    }
  };

  // Fetch video history from Nhost database
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await nhost.graphql.request(`
          query getHistory($user_id: uuid!) {
            summaries(where: { user_id: { _eq: $user_id } }) {
              summary_id
              title
              youtube_url
              summary_content
            }
          }
        `, {
          user_id: user.id
        });
        setHistory(response.data.summaries); // Set history to the fetched summaries
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError('Failed to fetch history. Please try again.');
      }
    };

    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');
    try {
      const response = await axios.post(import.meta.env.VITE_API_URL, { "youtubeUrl": url });
      setSummary(response.data.summary);
      await saveSummary(url, response.data.summary, response.data.title);
      setHistory(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Failed to get summary:', err.message);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-6">
      <div className="w-full flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <Youtube className="h-8 w-8 text-red-600" />
          <h1 className="text-2xl font-bold">YouTube Video Summarizer</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-6">
        {/* History Section */}
        <div className="w-1/4 flex flex-col rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold">History</h2>
          <div className="space-y-2">
            {history.length > 0 ? (
              history.slice().reverse().map((item) => (
                <button
                  key={item.summary_id}
                  className="group flex justify-between items-center p-4 rounded-lg hover:bg-blue-600 text-white transition-colors"
                  onClick={() => setSummary(item.summary_content)}
                >
                  <h3 className="text-sm font-medium text-gray-700 group-hover:text-white">{item.title}</h3>
                </button>
              ))
            ) : (
              <p className="text-gray-400">No history available.</p>
            )}
          </div>
        </div>


        {/* Chat / Summary Section */}
        <div className="flex-1 bg-white rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-lg font-medium text-gray-700">
                YouTube Video URL
              </label>
              <input
                type="url"
                id="url"
                required
                className="mt-1 p-5 block w-full rounded-md border-gray-300 border-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            {error && <ErrorMessage message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Generating Summary...' : 'Generate Summary'}
            </button>
          </form>

          {summary && <SummaryDisplay summary={summary} />}
        </div>
      </div>
    </div>
  );
}
