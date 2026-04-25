import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CourseFeedback.css';

const CourseFeedback = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [feedback, setFeedback] = useState({
    courseId: '',
    rating: 5,
    instructorRating: 5,
    contentClarity: 5,
    courseDelivery: 5,
    materials: 5,
    comments: '',
    suggestions: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/student/enrolled-courses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCourses(response.data);
    } catch (err) {
      setError('Failed to fetch courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    setFeedback({
      ...feedback,
      courseId: courseId
    });
    setSubmitted(false);
  };

  const handleRatingChange = (field, value) => {
    setFeedback({
      ...feedback,
      [field]: parseInt(value)
    });
  };

  const handleTextChange = (field, value) => {
    setFeedback({
      ...feedback,
      [field]: value
    });
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/student/feedback', feedback, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSubmitted(true);
      setError('');
      setTimeout(() => {
        setFeedback({
          courseId: '',
          rating: 5,
          instructorRating: 5,
          contentClarity: 5,
          courseDelivery: 5,
          materials: 5,
          comments: '',
          suggestions: ''
        });
        setSelectedCourse('');
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const RatingScale = ({ label, field, value }) => (
    <div className="rating-item">
      <label>{label}</label>
      <div className="rating-scale">
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            className={`rating-button ${value === num ? 'active' : ''}`}
            onClick={() => handleRatingChange(field, num)}
            type="button"
          >
            {num}
          </button>
        ))}
      </div>
      <span className="rating-value">{value}/5</span>
    </div>
  );

  return (
    <div className="course-feedback-container">
      <div className="feedback-header">
        <h1>Course Feedback</h1>
        <p>Share your experience and help us improve</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {submitted && <div className="success-message">Thank you! Your feedback has been submitted successfully.</div>}

      <div className="feedback-content">
        <div className="course-selection">
          <h2>Select a Course</h2>
          {loading ? (
            <p>Loading courses...</p>
          ) : courses.length === 0 ? (
            <p>No enrolled courses found</p>
          ) : (
            <div className="course-list">
              {courses.map(course => (
                <button
                  key={course.id}
                  className={`course-card ${selectedCourse === course.id ? 'selected' : ''}`}
                  onClick={() => handleCourseSelect(course.id)}
                >
                  <h3>{course.name}</h3>
                  <p>{course.code}</p>
                  <p className="instructor">Instructor: {course.instructor}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedCourse && (
          <form className="feedback-form" onSubmit={handleSubmitFeedback}>
            <h2>Provide Your Feedback</h2>

            <div className="feedback-section">
              <h3>Ratings (1 = Poor, 5 = Excellent)</h3>
              <RatingScale label="Overall Course Rating" field="rating" value={feedback.rating} />
              <RatingScale label="Instructor Effectiveness" field="instructorRating" value={feedback.instructorRating} />
              <RatingScale label="Content Clarity" field="contentClarity" value={feedback.contentClarity} />
              <RatingScale label="Course Delivery" field="courseDelivery" value={feedback.courseDelivery} />
              <RatingScale label="Learning Materials Quality" field="materials" value={feedback.materials} />
            </div>

            <div className="feedback-section">
              <h3>Additional Comments</h3>
              <textarea
                className="feedback-textarea"
                placeholder="What did you like most about this course?"
                value={feedback.comments}
                onChange={(e) => handleTextChange('comments', e.target.value)}
                rows="4"
              />
            </div>

            <div className="feedback-section">
              <h3>Suggestions for Improvement</h3>
              <textarea
                className="feedback-textarea"
                placeholder="How can we improve this course?"
                value={feedback.suggestions}
                onChange={(e) => handleTextChange('suggestions', e.target.value)}
                rows="4"
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CourseFeedback;
