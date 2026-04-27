import { useEffect, useState } from "react";
import { createDailyRecord } from "./api";

function DailyEntryForm({ onRecordAdded, assignedPondId, role, ponds = [] }) {
  const [formData, setFormData] = useState({
    pond_id: assignedPondId || "",
    date: "",
    fish_count: "",
    average_weight_g: "",
    feed_given_kg: "",
    water_temperature_c: "",
    ph: "",
    dissolved_oxygen: "",
    mortality_count: "",
    observations: "",
  });

  const [message, setMessage] = useState("");
  const isAdmin = role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      setFormData((prev) => ({
        ...prev,
        pond_id: assignedPondId || "",
      }));
    }
  }, [assignedPondId, isAdmin]);

  useEffect(() => {
    if (isAdmin && ponds.length > 0 && !formData.pond_id) {
      setFormData((prev) => ({
        ...prev,
        pond_id: ponds[0].id,
      }));
    }
  }, [isAdmin, ponds, formData.pond_id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      pond_id: isAdmin
        ? ponds.length > 0
          ? ponds[0].id
          : ""
        : assignedPondId || "",
      date: "",
      fish_count: "",
      average_weight_g: "",
      feed_given_kg: "",
      water_temperature_c: "",
      ph: "",
      dissolved_oxygen: "",
      mortality_count: "",
      observations: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        ...formData,
        pond_id: Number(formData.pond_id),
        fish_count: formData.fish_count === "" ? null : Number(formData.fish_count),
        average_weight_g:
          formData.average_weight_g === ""
            ? null
            : Number(formData.average_weight_g),
        feed_given_kg:
          formData.feed_given_kg === ""
            ? null
            : Number(formData.feed_given_kg),
        water_temperature_c:
          formData.water_temperature_c === ""
            ? null
            : Number(formData.water_temperature_c),
        ph: formData.ph === "" ? null : Number(formData.ph),
        dissolved_oxygen:
          formData.dissolved_oxygen === ""
            ? null
            : Number(formData.dissolved_oxygen),
        mortality_count:
          formData.mortality_count === ""
            ? null
            : Number(formData.mortality_count),
      };

      const result = await createDailyRecord(payload);

      if (result.alertCreated) {
        setMessage("Record submitted successfully. Alert created for this pond.");
      } else {
        setMessage(result.message || "Record submitted successfully");
      }

      resetForm();

      if (onRecordAdded) {
        await onRecordAdded();
      }
    } catch (error) {
      console.error("Error submitting record:", error);
      setMessage(error.message || "Failed to submit record");
    }
  };

  return (
    <div className="card">
      <h2>Daily Pond Entry</h2>

      <form onSubmit={handleSubmit} className="form-grid">
        {isAdmin ? (
          <select
            name="pond_id"
            value={formData.pond_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Pond</option>
            {ponds.map((pond) => (
              <option key={pond.id} value={pond.id}>
                {pond.pond_name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            name="pond_id"
            placeholder="Pond ID"
            value={formData.pond_id}
            onChange={handleChange}
            required
            disabled
          />
        )}

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="fish_count"
          placeholder="Fish Count"
          value={formData.fish_count}
          onChange={handleChange}
        />

        <input
          type="number"
          step="0.01"
          name="average_weight_g"
          placeholder="Average Weight (g)"
          value={formData.average_weight_g}
          onChange={handleChange}
        />

        <input
          type="number"
          step="0.01"
          name="feed_given_kg"
          placeholder="Feed Given (kg)"
          value={formData.feed_given_kg}
          onChange={handleChange}
        />

        <input
          type="number"
          step="0.01"
          name="water_temperature_c"
          placeholder="Water Temp (°C)"
          value={formData.water_temperature_c}
          onChange={handleChange}
        />

        <input
          type="number"
          step="0.01"
          name="ph"
          placeholder="pH"
          value={formData.ph}
          onChange={handleChange}
        />

        <input
          type="number"
          step="0.01"
          name="dissolved_oxygen"
          placeholder="Dissolved Oxygen"
          value={formData.dissolved_oxygen}
          onChange={handleChange}
        />

        <input
          type="number"
          name="mortality_count"
          placeholder="Mortality Count"
          value={formData.mortality_count}
          onChange={handleChange}
        />

        <textarea
          name="observations"
          placeholder="Observations"
          value={formData.observations}
          onChange={handleChange}
          rows="4"
        />

        <button type="submit">Submit Record</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default DailyEntryForm;