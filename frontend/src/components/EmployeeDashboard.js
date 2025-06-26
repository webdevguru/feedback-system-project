import { motion } from 'framer-motion';
import { AlertCircle, Check, MessageSquare, ThumbsDown, ThumbsUp, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';

function EmployeeDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/employee');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (feedbackId) => {
    toast.promise(
      api.post(`/feedback/${feedbackId}/acknowledge`).then(() => {
        fetchDashboardData();
      }),
      {
        loading: 'Acknowledging...',
        success: 'Feedback acknowledged!',
        error: 'Failed to acknowledge feedback.',
      }
    );
  };

  const StatCard = ({ icon, label, value }) => (
    <div className="text-center p-4">
      {React.cloneElement(icon, { className: "h-10 w-10 text-gray-200 mx-auto"})}
      <p className="mt-2 text-4xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-300">{label}</p>
    </div>
  );
  
  const FeedbackCard = ({ feedback }) => {
    const sentimentStyles = {
      positive: {
        icon: <ThumbsUp className="h-6 w-6 text-green-400" />,
        borderColor: 'border-green-400',
      },
      negative: {
        icon: <ThumbsDown className="h-6 w-6 text-red-400" />,
        borderColor: 'border-red-400',
      },
      neutral: {
        icon: <MessageSquare className="h-6 w-6 text-sky-400" />,
        borderColor: 'border-sky-400',
      },
    };
  
    const styles = sentimentStyles[feedback.sentiment] || sentimentStyles.neutral;

    return (
      <div className={`bg-blue-900/50 backdrop-blur-md border border-blue-700/50 rounded-xl shadow-lg border-l-4 ${styles.borderColor} overflow-hidden`}>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
               {styles.icon}
              <div>
                <p className={`text-lg font-bold capitalize text-white`}>{feedback.sentiment} Feedback</p>
                <p className="text-xs text-gray-300 font-medium">
                  Received on {new Date(feedback.created_at).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
            {feedback.acknowledged ? (
              <div className="flex items-center text-xs font-semibold text-gray-300 bg-white/10 px-3 py-1.5 rounded-full">
                <Check className="h-4 w-4 mr-1.5" />
                Acknowledged
              </div>
            ) : (
               <button
                  onClick={() => handleAcknowledge(feedback.id)}
                  className={`flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md`}
                >
                  Acknowledge
                </button>
            )}
          </div>
        </div>
        
        {(feedback.strengths || feedback.areas_to_improve) && (
          <div className={`p-5 border-t border-blue-700/50 space-y-4`}>
            {feedback.strengths && (
                <div>
                    <h4 className="flex items-center text-md font-semibold text-gray-200 mb-2">
                        <TrendingUp className="h-5 w-5 mr-3 text-green-400" />
                        Strengths
                    </h4>
                    <p className="text-gray-300 text-sm pl-8 leading-relaxed">{feedback.strengths}</p>
                </div>
            )}
            {feedback.areas_to_improve && (
                <div>
                    <h4 className="flex items-center text-md font-semibold text-gray-200 mb-2">
                        <TrendingDown className="h-5 w-5 mr-3 text-red-400" />
                        Areas for Improvement
                    </h4>
                    <p className="text-gray-300 text-sm pl-8 leading-relaxed">{feedback.areas_to_improve}</p>
                </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-white/80 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl md:text-4xl font-bold text-white">Your Dashboard</h1>
        <p className="mt-1 text-gray-300">Here's a summary of the feedback you've received.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <StatCard 
            icon={<MessageSquare />}
            label="Total Feedback Received"
            value={dashboardData?.feedback_timeline?.length || 0}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={<AlertCircle />}
            label="Awaiting Acknowledgement"
            value={dashboardData?.unacknowledged_count || 0}
          />
        </motion.div>
      </div>
      
      <motion.h2 
        variants={itemVariants} 
        className="text-2xl md:text-3xl font-bold text-white text-center pt-4"
      >
        Feedback Timeline
      </motion.h2>
      
      {dashboardData?.feedback_timeline?.length > 0 ? (
        <div className="space-y-6">
          {dashboardData.feedback_timeline.map((fb, index) => (
            <motion.div variants={itemVariants} key={fb.id}>
              <FeedbackCard feedback={fb} />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div variants={itemVariants} className="text-center py-16 bg-blue-900/50 backdrop-blur-md border border-blue-700/50 rounded-xl">
          <MessageSquare className="h-16 w-16 text-gray-500 mx-auto" />
          <h3 className="mt-6 text-xl font-bold text-gray-200">No Feedback Yet</h3>
          <p className="mt-2 text-sm text-gray-400">When your manager provides feedback, it will appear here.</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default EmployeeDashboard;