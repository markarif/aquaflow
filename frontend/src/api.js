const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleApiResponse = async (response) => {
  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Invalid server response");
  }

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
};

/* =========================
   PUBLIC LANDING PAGE API
========================= */

export const getLandingSummary = async () => {
  const response = await fetch(
    `${BASE_URL}/api/public/landing-summary?t=${Date.now()}`
  );

  const data = await handleApiResponse(response);

  return {
    metrics: {
      activePonds: data.metrics?.activePonds || 0,
      openAlerts: data.metrics?.openAlerts || 0,
      recordsToday: data.metrics?.recordsToday || 0,
      pondHealth: data.metrics?.pondHealth || 0,
    },
    ponds: data.ponds || [],
    latestInsight: data.latestInsight || null,
  };
};

/* =========================
   PRIVATE READ APIs
========================= */

export const getPonds = async () => {
  const response = await fetch(`${BASE_URL}/api/ponds`, {
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};

export const getDailyRecords = async () => {
  const response = await fetch(`${BASE_URL}/api/daily-records`, {
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};

export const getAiRecommendations = async () => {
  const response = await fetch(`${BASE_URL}/api/ai-recommendations`, {
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};

export const getAlerts = async () => {
  const response = await fetch(`${BASE_URL}/api/alerts`, {
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};

export const getUsers = async () => {
  const response = await fetch(`${BASE_URL}/api/users`, {
    headers: getAuthHeaders(),
  });
  return handleApiResponse(response);
};

/* =========================
   DAILY RECORDS
========================= */

export const createDailyRecord = async (recordData) => {
  const response = await fetch(`${BASE_URL}/api/daily-records`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(recordData),
  });

  return handleApiResponse(response);
};

export const updateDailyRecord = async (recordId, recordData) => {
  const response = await fetch(`${BASE_URL}/api/daily-records/${recordId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(recordData),
  });

  return handleApiResponse(response);
};

export const deleteDailyRecord = async (recordId) => {
  const response = await fetch(`${BASE_URL}/api/daily-records/${recordId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

/* =========================
   USERS
========================= */

export const createUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/api/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  return handleApiResponse(response);
};

export const updateUser = async (userId, userData) => {
  const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  return handleApiResponse(response);
};

export const updateUserPassword = async (userId, passwordData) => {
  const response = await fetch(`${BASE_URL}/api/users/${userId}/password`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(passwordData),
  });

  return handleApiResponse(response);
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

/* =========================
   PONDS
========================= */

export const createPond = async (pondData) => {
  const response = await fetch(`${BASE_URL}/api/ponds`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(pondData),
  });

  return handleApiResponse(response);
};

export const updatePond = async (pondId, pondData) => {
  const response = await fetch(`${BASE_URL}/api/ponds/${pondId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(pondData),
  });

  return handleApiResponse(response);
};

export const deletePond = async (pondId) => {
  const response = await fetch(`${BASE_URL}/api/ponds/${pondId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

/* =========================
   ALERTS
========================= */

export const updateAlert = async (alertId, alertData) => {
  const response = await fetch(`${BASE_URL}/api/alerts/${alertId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(alertData),
  });

  return handleApiResponse(response);
};

export const deleteAlert = async (alertId) => {
  const response = await fetch(`${BASE_URL}/api/alerts/${alertId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};