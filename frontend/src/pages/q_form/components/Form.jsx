import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Form.css";

const experienceOptions = [
  "Fresher",
  "1-2 years",
  "3-5 years",
  "6-10 years",
  "10+ years",
];

const interviewFieldOptions = [
  "Architecture", "Software Engineering", "Data Science", "Cybersecurity",
  "Cloud Computing", "Networking", "DevOps", "AI & Machine Learning",
  "Game Development", "Blockchain", "UI/UX Design", "Embedded Systems",
  "Mobile Development", "Quality Assurance", "Database Administration",
  "System Administration", "IT Support", "Technical Writing",
  "Project Management", "Business Analysis", "Healthcare IT", "Digital Marketing",
  "E-Commerce", "Renewable Energy", "Automotive Engineering", "Aerospace Engineering",
  "Education Technology", "Biotechnology", "Robotics", "Agricultural Technology",
  "Construction Management", "Media and Entertainment", "Finance Technology",
  "Insurance Technology", "Legal Technology", "Supply Chain Management", "Retail Technology",
  "Hospitality Management", "Event Management", "Customer Relationship Management", "Human Resources"
];

const Form = () => {
  const [formData, setFormData] = useState({
    experience: "",
    designation: "",
    interview_field: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token"); // Get token from local storage

      const response = await axios.post(
        "http://localhost:5000/update_profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the request
          },
        }
      );

      if (response.status === 200) {
        alert("Profile updated successfully!");
        navigate("/dashboard"); // Redirect to dashboard after profile update
      }
    } catch (err) {
      setError(
        err.response?.data?.msg || "An error occurred while updating the profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <h1 className="form-heading">Complete Your Profile</h1>
        {error && <div className="form-error">{error}</div>}
        <form className="form" onSubmit={handleSubmit}>
          {/* Experience Dropdown */}
          <div className="form-group">
            <label htmlFor="experience">Experience</label>
            <select
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
            >
              <option value="">Select Experience Level</option>
              {experienceOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Designation Input */}
          <div className="form-group">
            <label htmlFor="designation">Designation</label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Enter designation"
              required
            />
          </div>

          {/* Interview Field Dropdown */}
          <div className="form-group">
            <label htmlFor="interview_field">Interview Field</label>
            <select
              id="interview_field"
              name="interview_field"
              value={formData.interview_field}
              onChange={handleChange}
              required
            >
              <option value="">Select Interview Field</option>
              {interviewFieldOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;
