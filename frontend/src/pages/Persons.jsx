import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';

export default function Persons() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const emptyForm = {
    first_name: '',
    last_name: '',
    email: '',
    dni: '',
    legajo: '',
    unit: '',
    sentence_years: '',
    admission_date: '',
    status: 'active',
  };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const firstFieldRef = useRef(null);
  const initialFormRef = useRef(emptyForm);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    fetchPersons();
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    if (firstFieldRef.current) {
      firstFieldRef.current.focus();
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal]);

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
    const payload = {
      ...form,
      sentence_years: form.sentence_years === '' ? null : Number(form.sentence_years),
      admission_date: form.admission_date === '' ? null : form.admission_date,
    };
    try {
      if (editingId) {
        await api.put(`/persons/${editingId}/`, payload);
      } else {
        await api.post('/persons/', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowModal(false);
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

  const handleEdit = (person) => {
    const next = {
      first_name: person.first_name || '',
      last_name: person.last_name || '',
      email: person.email || '',
      dni: person.dni || '',
      legajo: person.legajo || '',
      unit: person.unit || '',
      sentence_years: person.sentence_years ?? '',
      admission_date: person.admission_date || '',
      status: person.status || 'active',
    };
    setForm(next);
    initialFormRef.current = next;
    setEditingId(person.id);
    setShowModal(true);
  };

  const isDirty = () => JSON.stringify(form) !== JSON.stringify(initialFormRef.current);

  const handleCancel = (force = false) => {
    if (!force && isDirty()) {
      const ok = confirm('Hay cambios sin guardar. ¿Querés descartarlos?');
      if (!ok) return;
    }
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setShowModal(false);
  };

  const filtered = persons.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || (
      (p.first_name || '').toLowerCase().includes(q) ||
      (p.last_name || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.dni || '').toLowerCase().includes(q) ||
      (p.legajo || '').toLowerCase().includes(q)
    );
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesUnit = !unitFilter.trim()
      ? true
      : (p.unit || '').toLowerCase().includes(unitFilter.trim().toLowerCase());
    const admission = p.admission_date ? new Date(p.admission_date) : null;
    const fromOk = !dateFrom || (admission && admission >= new Date(dateFrom));
    const toOk = !dateTo || (admission && admission <= new Date(dateTo));
    return matchesQuery && matchesStatus && matchesUnit && fromOk && toOk;
  });

  const getSortValue = (p, key) => {
    if (key === 'name') return `${p.last_name || ''} ${p.first_name || ''}`.toLowerCase();
    if (key === 'dni') return p.dni || '';
    if (key === 'legajo') return p.legajo || '';
    if (key === 'unit') return p.unit || '';
    if (key === 'sentence_years') return p.sentence_years ?? -1;
    if (key === 'admission_date') return p.admission_date || '';
    if (key === 'status') return p.status || '';
    return '';
  };

  const sorted = [...filtered].sort((a, b) => {
    const va = getSortValue(a, sortKey);
    const vb = getSortValue(b, sortKey);
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const statusBadge = (status) => {
    if (status === 'active') return <span className="badge badge-active">Activo</span>;
    if (status === 'transferred') return <span className="badge badge-transferred">Trasladado</span>;
    if (status === 'released') return <span className="badge badge-released">Liberado</span>;
    return <span className="badge">{status || '-'}</span>;
  };

  const summary = filtered.reduce(
    (acc, p) => {
      acc.total += 1;
      if (p.status === 'active') acc.active += 1;
      if (p.status === 'transferred') acc.transferred += 1;
      if (p.status === 'released') acc.released += 1;
      return acc;
    },
    { total: 0, active: 0, transferred: 0, released: 0 }
  );

  const exportCsv = () => {
    const headers = [
      'id',
      'first_name',
      'last_name',
      'email',
      'dni',
      'legajo',
      'unit',
      'sentence_years',
      'admission_date',
      'status',
      'created_at',
    ];
    const rows = filtered.map((p) => ([
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.dni,
      p.legajo,
      p.unit,
      p.sentence_years,
      p.admission_date,
      p.status,
      p.created_at,
    ]));
    const escape = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };
    const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-shell fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Personas</h2>
          <p className="page-subtitle">Administración de internos, unidad y estado actual.</p>
        </div>
        <div className="toolbar">
          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setErrors({});
              setEditingId(null);
              initialFormRef.current = emptyForm;
              setShowModal(true);
            }}
          >
            Nueva persona
          </button>
          <a className="btn-ghost" href="/audit">Ver auditoría</a>
          <a className="btn-ghost" href="http://127.0.0.1:8001/admin/" target="_blank" rel="noreferrer">
            Admin Django
          </a>
          <input
            placeholder="Buscar por nombre o email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            placeholder="Unidad"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="active">Activo</option>
            <option value="transferred">Trasladado</option>
            <option value="released">Liberado</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <button type="button" className="btn-ghost" onClick={exportCsv}>
            Exportar CSV
          </button>
          {(query || unitFilter || statusFilter !== 'all' || dateFrom || dateTo) && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setQuery('');
                setUnitFilter('');
                setStatusFilter('all');
                setDateFrom('');
                setDateTo('');
              }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="label">Total</div>
          <div className="value">{summary.total}</div>
        </div>
        <div className="stat-card">
          <div className="label">Activos</div>
          <div className="value">{summary.active}</div>
        </div>
        <div className="stat-card">
          <div className="label">Trasladados</div>
          <div className="value">{summary.transferred}</div>
        </div>
        <div className="stat-card">
          <div className="label">Liberados</div>
          <div className="value">{summary.released}</div>
        </div>
      </div>

      <div className="card">
        <h3>Listado ({filtered.length})</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button className="btn-ghost" type="button" onClick={() => toggleSort('name')}>
                      Apellido {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </button>
                  </th>
                  <th>
                    <button className="btn-ghost" type="button" onClick={() => toggleSort('dni')}>
                      DNI {sortKey === 'dni' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </button>
                  </th>
                  <th>
                    <button className="btn-ghost" type="button" onClick={() => toggleSort('legajo')}>
                      Legajo {sortKey === 'legajo' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </button>
                  </th>
                  <th>
                    <button className="btn-ghost" type="button" onClick={() => toggleSort('unit')}>
                      Unidad {sortKey === 'unit' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </button>
                  </th>
                  <th>
                    <button className="btn-ghost" type="button" onClick={() => toggleSort('sentence_years')}>
                      Condena {sortKey === 'sentence_years' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </button>
                  </th>
                  <th>
                    <button className="btn-ghost" type="button" onClick={() => toggleSort('admission_date')}>
                      Ingreso {sortKey === 'admission_date' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </button>
                  </th>
                  <th>
                    <button className="btn-ghost" type="button" onClick={() => toggleSort('status')}>
                      Estado {sortKey === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </button>
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div>{p.last_name}, {p.first_name}</div>
                    </td>
                    <td>{p.dni || '-'}</td>
                    <td>{p.legajo || '-'}</td>
                    <td>{p.unit || '-'}</td>
                    <td>{p.sentence_years ?? '-'}</td>
                    <td>{p.admission_date || '-'}</td>
                    <td>{statusBadge(p.status)}</td>
                    <td>
                      <button className="btn-ghost" onClick={() => handleEdit(p)}>
                        Editar
                      </button>{' '}
                      <button className="btn-danger" onClick={() => handleDelete(p.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => handleCancel()}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Editar persona' : 'Nueva persona'}</h3>
              <button className="btn-ghost" type="button" onClick={() => handleCancel()}>Cerrar</button>
            </div>
            <form onSubmit={handleCreate} className="form-grid">
              <div className="field">
                <label>Nombre</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  ref={firstFieldRef}
                />
                {errors.first_name && <div className="error-text">{errors.first_name}</div>}
              </div>
              <div className="field">
                <label>Apellido</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} />
                {errors.last_name && <div className="error-text">{errors.last_name}</div>}
              </div>
              <div className="field">
                <label>Email</label>
                <input name="email" value={form.email} onChange={handleChange} />
                {errors.email && <div className="error-text">{errors.email}</div>}
              </div>
              <div className="field">
                <label>DNI</label>
                <input name="dni" value={form.dni} onChange={handleChange} />
                {errors.dni && <div className="error-text">{errors.dni}</div>}
              </div>
              <div className="field">
                <label>Legajo</label>
                <input
                  name="legajo"
                  value={form.legajo}
                  onChange={handleChange}
                  placeholder="LEG-000123"
                />
                {errors.legajo && <div className="error-text">{errors.legajo}</div>}
              </div>
              <div className="field">
                <label>Unidad</label>
                <input name="unit" value={form.unit} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Condena (años)</label>
                <input
                  name="sentence_years"
                  type="number"
                  min="0"
                  value={form.sentence_years}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>Fecha de ingreso</label>
                <input
                  name="admission_date"
                  type="date"
                  value={form.admission_date}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>Estado</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Activo</option>
                  <option value="transferred">Trasladado</option>
                  <option value="released">Liberado</option>
                </select>
              </div>
              <div className="form-actions">
                <button className="btn-primary" type="submit">
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" className="btn-ghost" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
