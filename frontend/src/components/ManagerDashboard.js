import { Edit, Eye, MessageSquare, Plus, Trash2, TrendingUp, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import AddEmployeeForm from './AddEmployeeForm';
import FeedbackForm from './FeedbackForm';

function ManagerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedbackHistory, setShowFeedbackHistory] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] = useState(null);
  const [feedbackToEdit, setFeedbackToEdit] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/manager');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    setShowFeedbackForm(false);
    setSelectedEmployee(null);
    setFeedbackToEdit(null);
    await fetchDashboardData();
    toast.success(feedbackToEdit ? 'Feedback updated successfully!' : 'Feedback submitted successfully!');
  };

  const handleAddEmployeeSubmit = async () => {
    setShowAddEmployeeForm(false);
    await fetchDashboardData();
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api.delete(`/users/${employeeId}`);
      toast.success("Employee deleted!");
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to delete employee.");
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback? This action cannot be undone.")) return;
    try {
      await api.delete(`/feedback/${feedbackId}`);
      toast.success("Feedback deleted!");
      setFeedbackHistory(feedbackHistory.filter(f => f.id !== feedbackId));
      fetchDashboardData(); // Refresh counts
    } catch (error) {
      toast.error("Failed to delete feedback.");
    }
  };

  const handleViewFeedbackHistory = async (employee) => {
    setSelectedEmployeeForHistory(employee);
    setLoading(true);
    try {
      const response = await api.get(`/feedback?employee_id=${employee.id}`);
      setFeedbackHistory(response.data);
      setShowFeedbackHistory(true);
    } catch (error) {
      toast.error("Failed to load feedback history.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditFeedback = (feedback) => {
    setFeedbackToEdit(feedback);
    setShowFeedbackHistory(false);
    setShowFeedbackForm(true);
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'neutral': return 'text-yellow-600 bg-yellow-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Manager Dashboard</h1>
          <p className="text-green-300">Manage your team and provide feedback</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setSelectedEmployee(null);
              setFeedbackToEdit(null);
              setShowFeedbackForm(true);
            }}
            className="w-full sm:w-auto flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Give Feedback
          </button>
          <button
            onClick={() => setShowAddEmployeeForm(true)}
            className="w-full sm:w-auto flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.team_members?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.total_feedback_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sentiment Trend</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.sentiment_distribution?.positive || 0} Positive
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white dark:bg-gray-900/50 dark:border dark:border-white/10 rounded-lg shadow overflow-x-auto">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Team Members</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {dashboardData?.team_members?.map((member) => (
            <div key={member.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {member.feedback_count} feedback given
                  {member.last_feedback_date && (
                    <span className="dark:text-gray-500"> • Last: {new Date(member.last_feedback_date).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => handleViewFeedbackHistory(member)}
                  className="justify-center px-3 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View/Manage</span>
                </button>
                <button
                  onClick={() => handleDeleteEmployee(member.id)}
                  className="justify-center px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment Distribution */}
      {dashboardData?.sentiment_distribution && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Sentiment Distribution</h2>
          </div>
          <div className="px-6 py-4">
            <div className="flex space-x-4">
              {Object.entries(dashboardData.sentiment_distribution).map(([sentiment, count]) => (
                <div key={sentiment} className="flex items-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(sentiment)}`}>
                    {sentiment}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Form Modal */}
      {showAddEmployeeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30">
            <AddEmployeeForm
              onSubmit={handleAddEmployeeSubmit}
              onCancel={() => setShowAddEmployeeForm(false)}
            />
          </div>
        </div>
      )}

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <FeedbackForm
            employee={selectedEmployee}
            feedbackToEdit={feedbackToEdit}
            onSubmit={handleFeedbackSubmit}
            onCancel={() => {
              setShowFeedbackForm(false);
              setSelectedEmployee(null);
              setFeedbackToEdit(null);
            }}
          />
        </div>
      )}

      {/* Feedback History Modal */}
      {showFeedbackHistory && selectedEmployeeForHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Feedback History for {selectedEmployeeForHistory.name}
              </h2>
              <button onClick={() => setShowFeedbackHistory(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {loading && <p className="dark:text-gray-300">Loading...</p>}
              {!loading && feedbackHistory.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No feedback has been given to this employee yet.</p>
              )}
              {feedbackHistory.map(fb => (
                <div key={fb.id} className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getSentimentColor(fb.sentiment)}`}>{fb.sentiment}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(fb.created_at).toLocaleString()}
                        {fb.acknowledged && <span className="text-green-500 font-semibold ml-2">(Acknowledged)</span>}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                       <button onClick={() => handleEditFeedback(fb)} className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteFeedback(fb.id)} className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Strengths</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{fb.strengths}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Areas to Improve</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{fb.areas_to_improve}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerDashboard; 