import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Persons() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    setLoading(true);
    try {
  const res = await api.get('/persons/');
      setPersons(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
  await api.post('/persons/', form);
      setForm({ first_name: '', last_name: '', email: '' });
      fetchPersons();
    } catch (err) {
      if (err.response && err.response.data) setErrors(err.response.data);
      else console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this person?')) return;
    try {
  await api.delete(`/persons/${id}/`);
      fetchPersons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Persons</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <div>
          <label>First name</label>
          <input name="first_name" value={form.first_name} onChange={handleChange} />
          {errors.first_name && <div style={{ color: 'red' }}>{errors.first_name}</div>}
        </div>
        <div>
          <label>Last name</label>
          <input name="last_name" value={form.last_name} onChange={handleChange} />
          {errors.last_name && <div style={{ color: 'red' }}>{errors.last_name}</div>}
        </div>
        <div>
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} />
          {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
        </div>
        <button type="submit">Create</button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>ID</th>
              <th>First</th>
              <th>Last</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {persons.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.first_name}</td>
                <td>{p.last_name}</td>
                <td>{p.email}</td>
                <td>
                  <button onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
