import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [actorFilter, setActorFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, actorFilter, dateFrom, dateTo]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== 'all') params.set('action', actionFilter);
      if (actorFilter.trim()) params.set('actor', actorFilter.trim());
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      const res = await api.get(`/audit-logs/?${params.toString()}`);
      setLogs(res.data);
      setPage(1);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Acceso restringido. Requiere rol administrador.');
      } else {
        setError('No se pudieron cargar los registros.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const actionLabel = (action) => {
    if (action === 'create') return 'Creación';
    if (action === 'update') return 'Actualización';
    if (action === 'delete') return 'Eliminación';
    return action;
  };

  return (
    <div className="page-shell fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Auditoría</h2>
          <p className="page-subtitle">Historial de acciones sobre personas.</p>
        </div>
        <div className="toolbar">
          <a className="btn-ghost" href="/persons">Volver a personas</a>
          <a className="btn-ghost" href="http://127.0.0.1:8001/admin/" target="_blank" rel="noreferrer">
            Admin Django
          </a>
        </div>
      </div>

      <div className="toolbar" style={{ marginBottom: 12 }}>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="all">Todas</option>
          <option value="create">Creación</option>
          <option value="update">Actualización</option>
          <option value="delete">Eliminación</option>
        </select>
        <input
          placeholder="Actor"
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
        />
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        {(actionFilter !== 'all' || actorFilter || dateFrom || dateTo) && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setActionFilter('all');
              setActorFilter('');
              setDateFrom('');
              setDateTo('');
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {error && <div className="error-text">{error}</div>}

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Acción</th>
                  <th>Persona</th>
                  <th>Actor</th>
                  <th>IP</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice((page - 1) * pageSize, page * pageSize).map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>{actionLabel(l.action)}</td>
                    <td>{l.person_name || l.person || '-'}</td>
                    <td>{l.actor_username ?? '-'}</td>
                    <td>{l.ip_address || '-'}</td>
                    <td>{formatDate(l.created_at)}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="6">Sin registros</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="toolbar" style={{ marginTop: 12 }}>
            <span className="tag">
              Página {page} de {Math.max(1, Math.ceil(logs.length / pageSize))}
            </span>
            <button
              className="btn-ghost"
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <button
              className="btn-ghost"
              type="button"
              disabled={page >= Math.ceil(logs.length / pageSize)}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
