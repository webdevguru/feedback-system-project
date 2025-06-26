import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';

function FeedbackForm({ employee, onSubmit, onCancel, feedbackToEdit }) {
  const [formData, setFormData] = useState({
    employee_id: '',
    strengths: '',
    areas_to_improve: '',
    sentiment: 'neutral'
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (feedbackToEdit) {
      setFormData({
        employee_id: feedbackToEdit.employee_id,
        strengths: feedbackToEdit.strengths,
        areas_to_improve: feedbackToEdit.areas_to_improve,
        sentiment: feedbackToEdit.sentiment
      });
      // We may need to fetch the employee's name if not readily available
    } else if (employee) {
      setFormData(prev => ({ ...prev, employee_id: employee.id }));
    } else {
      fetchTeamMembers();
    }
  }, [employee, feedbackToEdit]);

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/team');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employee_id) {
      toast.error('Please select an employee');
      return;
    }

    setLoading(true);
    try {
      if (feedbackToEdit) {
        await api.put(`/feedback/${feedbackToEdit.id}`, formData);
      } else {
        await api.post('/feedback', formData);
      }
      onSubmit();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(feedbackToEdit ? 'Failed to update feedback' : 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg dark:bg-gray-800">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {feedbackToEdit ? `Edit Feedback` : (employee ? `Give Feedback to ${employee.name}` : 'Give Feedback')}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {!employee && !feedbackToEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Employee
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              required
            >
              <option value="">Choose an employee...</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Overall Sentiment
          </label>
          <div className="flex space-x-4">
            {['positive', 'neutral', 'negative'].map((sentiment) => (
              <label key={sentiment} className="flex items-center">
                <input
                  type="radio"
                  name="sentiment"
                  value={sentiment}
                  checked={formData.sentiment === sentiment}
                  onChange={handleChange}
                  className="mr-2 text-gray-900 dark:text-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-400 capitalize">{sentiment}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Strengths
          </label>
          <textarea
            name="strengths"
            value={formData.strengths}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="What are the employee's key strengths?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Areas to Improve
          </label>
          <textarea
            name="areas_to_improve"
            value={formData.areas_to_improve}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="What areas could the employee improve on?"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? 'Submitting...' : (feedbackToEdit ? 'Save Changes' : 'Submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FeedbackForm; 