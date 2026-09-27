import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

const emptyExperience = {
  company: "",
  role: "",
  from: "",
  to: "",
};

const emptyEducation = {
  school: "",
  degree: "",
  from: "",
  to: "",
};

function Profile() {
  const { id } = useParams();

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const profileId = id || currentUserId;

  const isOwnProfile =
    profileId?.toString() ===
    currentUserId?.toString();

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    skills: "",
  });

  const [experience, setExperience] =
    useState([]);

  const [education, setEducation] =
    useState([]);

  const [profileImage, setProfileImage] =
    useState(null);

  const [bannerImage, setBannerImage] =
    useState(null);

  const [profilePreview, setProfilePreview] =
    useState("");

  const [bannerPreview, setBannerPreview] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showReport, setShowReport] =
    useState(false);

  const [reportReason, setReportReason] =
    useState("");

  const [reporting, setReporting] =
    useState(false);

  const getId = (item) => {
    if (!item) return null;

    if (typeof item === "string") {
      return item;
    }

    return item._id || item.id || null;
  };

  const getImageUrl = (image) => {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    return `${SERVER_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  const normalizeSkills = (skills) => {
    if (Array.isArray(skills)) {
      return skills;
    }

    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  const normalizeExperience = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => ({
      company: item?.company || "",
      role: item?.role || "",
      from: item?.from || "",
      to: item?.to || "",
    }));
  };

  const normalizeEducation = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => ({
      school: item?.school || "",
      degree: item?.degree || "",
      from: item?.from || "",
      to: item?.to || "",
    }));
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/users/${profileId}`,
        {
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load profile."
        );
      }

      const profile =
        data.user ||
        data.profile ||
        data.data;

      if (!profile) {
        throw new Error(
          "Profile data not found."
        );
      }

      setUser(profile);

      setForm({
        name: profile.name || "",
        bio: profile.bio || "",
        skills: normalizeSkills(
          profile.skills
        ).join(", "),
      });

      setExperience(
        normalizeExperience(
          profile.experience
        )
      );

      setEducation(
        normalizeEducation(
          profile.education
        )
      );

      setProfilePreview(
        getImageUrl(profile.profilePic)
      );

      setBannerPreview(
        getImageUrl(profile.banner)
      );
    } catch (err) {
      console.error(
        "Profile loading error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && profileId) {
      fetchProfile();
    }
  }, [profileId, token]);

  const handleFormChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (
    event
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile picture must be less than 5 MB."
      );
      return;
    }

    setError("");
    setProfileImage(file);

    setProfilePreview(
      URL.createObjectURL(file)
    );
  };

  const handleBannerImageChange = (
    event
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError(
        "Banner image must be less than 8 MB."
      );
      return;
    }

    setError("");
    setBannerImage(file);

    setBannerPreview(
      URL.createObjectURL(file)
    );
  };

  const addExperience = () => {
    setExperience((previous) => [
      ...previous,
      { ...emptyExperience },
    ]);
  };

  const removeExperience = (index) => {
    setExperience((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const updateExperience = (
    index,
    field,
    value
  ) => {
    setExperience((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addEducation = () => {
    setEducation((previous) => [
      ...previous,
      { ...emptyEducation },
    ]);
  };

  const removeEducation = (index) => {
    setEducation((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const updateEducation = (
    index,
    field,
    value
  ) => {
    setEducation((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const skills = normalizeSkills(
        form.skills
      );

      const cleanedExperience =
        experience
          .filter(
            (item) =>
              item.company.trim() ||
              item.role.trim() ||
              item.from ||
              item.to
          )
          .map((item) => ({
            company:
              item.company.trim(),
            role: item.role.trim(),
            from: item.from,
            to: item.to,
          }));

      const cleanedEducation =
        education
          .filter(
            (item) =>
              item.school.trim() ||
              item.degree.trim() ||
              item.from ||
              item.to
          )
          .map((item) => ({
            school:
              item.school.trim(),
            degree:
              item.degree.trim(),
            from: item.from,
            to: item.to,
          }));

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "bio",
        form.bio.trim()
      );

      formData.append(
        "skills",
        JSON.stringify(skills)
      );

      formData.append(
        "experience",
        JSON.stringify(
          cleanedExperience
        )
      );

      formData.append(
        "education",
        JSON.stringify(
          cleanedEducation
        )
      );

      if (profileImage) {
        formData.append(
          "profilePic",
          profileImage
        );
      }

      if (bannerImage) {
        formData.append(
          "banner",
          bannerImage
        );
      }

      const response = await fetch(
        `${API_URL}/users/${currentUserId}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile."
        );
      }

      const updatedUser =
        data.user ||
        data.profile ||
        data.data;

      if (updatedUser) {
        setUser(updatedUser);

        setForm({
          name: updatedUser.name || "",
          bio: updatedUser.bio || "",
          skills: normalizeSkills(
            updatedUser.skills
          ).join(", "),
        });

        setExperience(
          normalizeExperience(
            updatedUser.experience
          )
        );

        setEducation(
          normalizeEducation(
            updatedUser.education
          )
        );

        setProfilePreview(
          getImageUrl(
            updatedUser.profilePic
          )
        );

        setBannerPreview(
          getImageUrl(
            updatedUser.banner
          )
        );
      } else {
        await fetchProfile();
      }

      localStorage.setItem(
        "userName",
        form.name.trim()
      );

      setProfileImage(null);
      setBannerImage(null);

      setSuccess(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      setError(
        "Please enter a reason for reporting."
      );
      return;
    }

    try {
      setReporting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/reports`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            reportedUser: profileId,
            reason:
              reportReason.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit report."
        );
      }

      setReportReason("");
      setShowReport(false);

      setSuccess(
        "Report submitted successfully."
      );
    } catch (err) {
      console.error(
        "Report error:",
        err
      );

      setError(err.message);
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-52 bg-gray-200" />

            <div className="p-6">
              <div className="w-32 h-32 rounded-full bg-gray-200 -mt-20 border-4 border-white" />

              <div className="h-8 w-56 bg-gray-200 rounded mt-5" />

              <div className="h-4 w-72 bg-gray-200 rounded mt-3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Profile not found
          </h2>

          <p className="text-gray-500 mt-2">
            The requested profile could
            not be loaded.
          </p>

          <Link
            to="/dashboard"
            className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const skills = normalizeSkills(
    user.skills
  );

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-5xl mx-auto">

        {/* ALERTS */}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
            {success}
          </div>
        )}

        {/* PROFILE HEADER */}

        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

          <div
            className="h-52 bg-gradient-to-r from-blue-600 to-indigo-700 bg-cover bg-center"
            style={
              bannerPreview
                ? {
                    backgroundImage: `url("${bannerPreview}")`,
                  }
                : {}
            }
          />

          <div className="px-6 pb-6">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

              <div className="-mt-16">

                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-100 border-4 border-white shadow-md flex items-center justify-center text-blue-600 text-5xl font-bold">
                    {(user.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <h1 className="text-3xl font-bold text-gray-800 mt-4">
                  {user.name}
                </h1>

                {user.email && (
                  <p className="text-gray-500 mt-1">
                    {user.email}
                  </p>
                )}

              </div>

              <div className="flex gap-3">

                {isOwnProfile ? (
                  <a
                    href="#edit-profile"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
                  >
                    Edit Profile
                  </a>
                ) : (
                  <>
                    <Link
                      to="/messages"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
                    >
                      Message
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        setShowReport(true)
                      }
                      className="border border-red-300 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-lg font-semibold"
                    >
                      Report
                    </button>
                  </>
                )}

              </div>

            </div>

          </div>

        </section>

        {/* CONTENT */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* MAIN */}

          <div className="lg:col-span-2 space-y-6">

            {/* ABOUT */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-xl font-bold text-gray-800">
                About
              </h2>

              <p className="text-gray-600 mt-4 whitespace-pre-wrap">
                {user.bio ||
                  "No bio has been added yet."}
              </p>

            </section>

            {/* EXPERIENCE */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-bold text-gray-800">
                  Experience
                </h2>

              </div>

              {Array.isArray(
                user.experience
              ) &&
              user.experience.length > 0 ? (
                <div className="space-y-5 mt-5">

                  {user.experience.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex gap-4"
                      >

                        <div className="w-11 h-11 shrink-0 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
                          💼
                        </div>

                        <div>

                          <h3 className="font-bold text-gray-800">
                            {item.role ||
                              "Role"}
                          </h3>

                          <p className="text-gray-600 mt-1">
                            {item.company ||
                              "Company"}
                          </p>

                          {(item.from ||
                            item.to) && (
                            <p className="text-sm text-gray-400 mt-1">
                              {item.from ||
                                "Start"}{" "}
                              –{" "}
                              {item.to ||
                                "Present"}
                            </p>
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <p className="text-gray-400 mt-4">
                  No experience added yet.
                </p>
              )}

            </section>

            {/* EDUCATION */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-xl font-bold text-gray-800">
                Education
              </h2>

              {Array.isArray(
                user.education
              ) &&
              user.education.length > 0 ? (
                <div className="space-y-5 mt-5">

                  {user.education.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex gap-4"
                      >

                        <div className="w-11 h-11 shrink-0 rounded-lg bg-purple-100 flex items-center justify-center text-xl">
                          🎓
                        </div>

                        <div>

                          <h3 className="font-bold text-gray-800">
                            {item.degree ||
                              "Degree"}
                          </h3>

                          <p className="text-gray-600 mt-1">
                            {item.school ||
                              "Institution"}
                          </p>

                          {(item.from ||
                            item.to) && (
                            <p className="text-sm text-gray-400 mt-1">
                              {item.from ||
                                "Start"}{" "}
                              –{" "}
                              {item.to ||
                                "Present"}
                            </p>
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <p className="text-gray-400 mt-4">
                  No education added yet.
                </p>
              )}

            </section>

            {/* EDIT PROFILE */}

            {isOwnProfile && (
              <section
                id="edit-profile"
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >

                <div className="mb-6">

                  <h2 className="text-xl font-bold text-gray-800">
                    Edit Profile
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Update your professional
                    information.
                  </p>

                </div>

                <form
                  onSubmit={handleSave}
                  className="space-y-7"
                >

                  {/* BASIC INFORMATION */}

                  <div>

                    <h3 className="font-bold text-gray-800 mb-4">
                      Basic Information
                    </h3>

                    <div className="space-y-5">

                      <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Name
                        </label>

                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={
                            handleFormChange
                          }
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        />

                      </div>

                      <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bio
                        </label>

                        <textarea
                          name="bio"
                          value={form.bio}
                          onChange={
                            handleFormChange
                          }
                          rows="4"
                          placeholder="Tell people about yourself..."
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500"
                        />

                      </div>

                    </div>

                  </div>

                  {/* IMAGES */}

                  <div>

                    <h3 className="font-bold text-gray-800 mb-4">
                      Profile Images
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Profile Picture
                        </label>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={
                            handleProfileImageChange
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                        />

                        <p className="text-xs text-gray-400 mt-1">
                          Maximum size: 5 MB
                        </p>

                      </div>

                      <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Profile Banner
                        </label>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={
                            handleBannerImageChange
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                        />

                        <p className="text-xs text-gray-400 mt-1">
                          Maximum size: 8 MB
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* SKILLS */}

                  <div>

                    <h3 className="font-bold text-gray-800 mb-4">
                      Skills
                    </h3>

                    <input
                      type="text"
                      name="skills"
                      value={form.skills}
                      onChange={
                        handleFormChange
                      }
                      placeholder="React, Node.js, MongoDB, JavaScript"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />

                    <p className="text-xs text-gray-400 mt-1">
                      Separate skills with commas.
                    </p>

                  </div>

                  {/* EXPERIENCE */}

                  <div>

                    <div className="flex items-center justify-between mb-4">

                      <h3 className="font-bold text-gray-800">
                        Experience
                      </h3>

                      <button
                        type="button"
                        onClick={
                          addExperience
                        }
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        + Add Experience
                      </button>

                    </div>

                    {experience.length === 0 && (
                      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-5 text-center">
                        <p className="text-sm text-gray-500">
                          No experience added.
                        </p>

                        <button
                          type="button"
                          onClick={
                            addExperience
                          }
                          className="mt-2 text-blue-600 font-semibold text-sm"
                        >
                          Add your first experience
                        </button>
                      </div>
                    )}

                    <div className="space-y-5">

                      {experience.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-xl p-5"
                          >

                            <div className="flex justify-between items-center mb-4">

                              <p className="font-semibold text-gray-700">
                                Experience{" "}
                                {index + 1}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  removeExperience(
                                    index
                                  )
                                }
                                className="text-red-500 hover:text-red-700 text-sm font-semibold"
                              >
                                Remove
                              </button>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                              <div>

                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  Company
                                </label>

                                <input
                                  type="text"
                                  value={
                                    item.company
                                  }
                                  onChange={(e) =>
                                    updateExperience(
                                      index,
                                      "company",
                                      e.target
                                        .value
                                    )
                                  }
                                  placeholder="Company name"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                                />

                              </div>

                              <div>

                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  Role
                                </label>

                                <input
                                  type="text"
                                  value={
                                    item.role
                                  }
                                  onChange={(e) =>
                                    updateExperience(
                                      index,
                                      "role",
                                      e.target
                                        .value
                                    )
                                  }
                                  placeholder="Software Developer"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                                />

                              </div>

                              <div>

                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  From
                                </label>

                                <input
                                  type="text"
                                  value={
                                    item.from
                                  }
                                  onChange={(e) =>
                                    updateExperience(
                                      index,
                                      "from",
                                      e.target
                                        .value
                                    )
                                  }
                                  placeholder="2024"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                                />

                              </div>

                              <div>

                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  To
                                </label>

                                <input
                                  type="text"
                                  value={
                                    item.to
                                  }
                                  onChange={(e) =>
                                    updateExperience(
                                      index,
                                      "to",
                                      e.target
                                        .value
                                    )
                                  }
                                  placeholder="Present"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                                />

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>

                  {/* EDUCATION */}

                  <div>

                    <div className="flex items-center justify-between mb-4">

                      <h3 className="font-bold text-gray-800">
                        Education
                      </h3>

                      <button
                        type="button"
                        onClick={
                          addEducation
                        }
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        + Add Education
                      </button>

                    </div>

                    {education.length === 0 && (
                      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-5 text-center">
                        <p className="text-sm text-gray-500">
                          No education added.
                        </p>

                        <button
                          type="button"
                          onClick={
                            addEducation
                          }
                          className="mt-2 text-blue-600 font-semibold text-sm"
                        >
                          Add your education
                        </button>
                      </div>
                    )}

                    <div className="space-y-5">

                      {education.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-xl p-5"
                          >

                            <div className="flex justify-between items-center mb-4">

                              <p className="font-semibold text-gray-700">
                                Education{" "}
                                {index + 1}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  removeEducation(
                                    index
                                  )
                                }
                                className="text-red-500 hover:text-red-700 text-sm font-semibold"
                              >
                                Remove
                              </button>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                              <div>

                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  School / University
                                </label>

                                <input
                                  type="text"
                                  value={
                                    item.school
                                  }
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "school",
                                      e.target
                                        .value
                                    )
                                  }
                                  placeholder="University name"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                                />

                              </div>

                              <div>

                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  Degree
                                </label>

                                <input
                                  type="text"
                                  value={
                                    item.degree
                                  }
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "degree",
                                      e.target
                                        .value
                                    )
                                  }
                                  placeholder="B.Tech Computer Science"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                                />

                              </div>

                              <div>

                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  From
                                </label>

                                <input
                                  type="text"
                                  value={
                                    item.from
                                  }
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "from",
                                      e.target
                                        .value
                                    )
                                  }
                                  placeholder="2023"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                                />

                              </div>

                              <div>

                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  To
                                </label>

                                <input
                                  type="text"
                                  value={
                                    item.to
                                  }
                                  onChange={(e) =>
                                    updateEducation(
                                      index,
                                      "to",
                                      e.target
                                        .value
                                    )
                                  }
                                  placeholder="2027"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                                />

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-semibold"
                  >
                    {saving
                      ? "Saving Profile..."
                      : "Save Profile"}
                  </button>

                </form>

              </section>
            )}

          </div>

          {/* SIDEBAR */}

          <div className="space-y-6">

            {/* SKILLS */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-xl font-bold text-gray-800">
                Skills
              </h2>

              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-4">

                  {skills.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <p className="text-gray-400 mt-4">
                  No skills added yet.
                </p>
              )}

            </section>

            {/* PROFILE DETAILS */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-xl font-bold text-gray-800">
                Profile Details
              </h2>

              <div className="space-y-4 mt-5">

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Email
                  </p>

                  <p className="text-gray-700 mt-1 break-all">
                    {user.email ||
                      "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Role
                  </p>

                  <p className="text-gray-700 mt-1 capitalize">
                    {user.role || "User"}
                  </p>
                </div>

                {user.createdAt && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Joined
                    </p>

                    <p className="text-gray-700 mt-1">
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                )}

              </div>

            </section>

            {/* NAVIGATION */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-xl font-bold text-gray-800">
                Explore
              </h2>

              <div className="space-y-2 mt-4">

                <Link
                  to="/connections"
                  className="block px-4 py-3 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium"
                >
                  👥 My Network
                </Link>

                <Link
                  to="/feed"
                  className="block px-4 py-3 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium"
                >
                  📰 Feed
                </Link>

                <Link
                  to="/jobs"
                  className="block px-4 py-3 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium"
                >
                  💼 Jobs
                </Link>

                <Link
                  to="/messages"
                  className="block px-4 py-3 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium"
                >
                  💬 Messages
                </Link>

              </div>

            </section>

          </div>

        </div>

      </div>

      {/* REPORT MODAL */}

      {showReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold text-gray-800">
                Report User
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowReport(false)
                }
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>

            </div>

            <p className="text-sm text-gray-500 mt-2">
              Tell us why you are reporting
              this profile.
            </p>

            <textarea
              value={reportReason}
              onChange={(event) =>
                setReportReason(
                  event.target.value
                )
              }
              rows="5"
              placeholder="Enter report reason..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mt-5 resize-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-3 mt-5">

              <button
                type="button"
                onClick={() => {
                  setShowReport(false);
                  setReportReason("");
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReport}
                disabled={reporting}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg font-semibold"
              >
                {reporting
                  ? "Submitting..."
                  : "Submit Report"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Profile;