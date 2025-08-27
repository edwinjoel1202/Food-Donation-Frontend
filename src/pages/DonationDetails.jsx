// src/pages/DonationDetails.jsx
import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Modal, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import LoadingButton from '../components/LoadingButton';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';

const humanize = (key) => {
  if (!key) return '';
  // common friendly mappings
  const map = {
    carbs: 'Carbohydrates',
    carbohydrates: 'Carbohydrates',
    protein: 'Protein',
    fats: 'Fats',
    fat: 'Fats',
    fiber: 'Fiber',
    sugars: 'Sugars',
    sugar: 'Sugars',
    vitaminC: 'Vitamin C',
    vitaminB12: 'Vitamin B12',
    calcium: 'Calcium',
    iron: 'Iron',
    calories: 'Calories',
  };
  if (map[key]) return map[key];
  // fallback: split camelCase / snake_case and Title Case it
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // camelCase -> spaces
    .replace(/[_\-]+/g, ' '); // snake_case -> spaces
  return spaced.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
};

const DonationDetails = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [message, setMessage] = useState('');
  const [nutriOpen, setNutriOpen] = useState(false);
  const [nutriData, setNutriData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDonation();
    // eslint-disable-next-line
  }, [id]);

  const fetchDonation = async () => {
    try {
      const res = await api.get(`/donations/${id}`);
      setDonation(res.data);
    } catch (err) {
      toast.error('Failed to load donation');
    }
  };

  const handleRequest = async () => {
    try {
      await api.post('/requests', { donationId: Number(id), message });
      toast.success('Request sent');
      navigate('/requests');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to request');
    }
  };

  const handleGetNutrition = async () => {
    if (!donation) return;
    try {
      const res = await api.get('/ai/nutrition', {
        params: {
          name: donation.title || donation.description,
          quantity: donation.quantity || 1,
          unit: donation.unit || 'piece',
        },
      });

      const payload = res.data || {};

      // Normalize numeric key/value pairs
      const numericEntries = Object.entries(payload)
        .filter(([k, v]) => typeof v === 'number' && Number.isFinite(v))
        .map(([k, v]) => ({ key: k, label: humanize(k), value: Number(v) }));

      // If API returns numbers as strings, try to coerce those too
      const stringNumericEntries = Object.entries(payload)
        .filter(([k, v]) => typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)))
        .map(([k, v]) => ({ key: k, label: humanize(k), value: Number(v) }));

      const allEntriesMap = new Map();
      numericEntries.forEach(e => allEntriesMap.set(e.key, e));
      stringNumericEntries.forEach(e => {
        if (!allEntriesMap.has(e.key)) allEntriesMap.set(e.key, e);
      });

      const allEntries = Array.from(allEntriesMap.values());

      // Sort descending by value for bar chart
      const barData = allEntries.slice().sort((a, b) => b.value - a.value).map(e => ({ label: e.label, value: e.value }));

      // Identify macros for pie chart preference
      const macroKeysPreferred = ['protein', 'carbohydrates', 'carbs', 'fats', 'fat', 'fiber', 'sugars', 'sugar'];
      const macroEntries = [];
      const otherEntries = [];

      allEntries.forEach(e => {
        if (macroKeysPreferred.includes(e.key)) macroEntries.push(e);
        else otherEntries.push(e);
      });

      // If macros present, use them for pie chart (exclude calories)
      let pieData = [];
      if (macroEntries.length > 0) {
        // combine duplicates like 'carbs' and 'carbohydrates' if both present - by label
        const merged = new Map();
        macroEntries.forEach(e => {
          const lbl = e.label;
          merged.set(lbl, (merged.get(lbl) || 0) + e.value);
        });
        pieData = Array.from(merged.entries()).map(([label, value]) => ({ label, value }));
        // if pie sum is zero or trivial, fallback to top-5 barData without calories
        const sumPie = pieData.reduce((s, p) => s + Math.abs(p.value), 0);
        if (sumPie === 0) pieData = [];
      }

      if (pieData.length === 0) {
        // fallback: top 5 values excluding calories (calories is absolute energy, not a composition)
        const fallback = barData.filter(b => b.label.toLowerCase() !== 'calories').slice(0, 5);
        pieData = fallback.length ? fallback : barData.slice(0, Math.min(5, barData.length));
      }

      // Micro nutrients: keep those that are not in pie (and not calories)
      const pieLabels = new Set(pieData.map(p => p.label));
      const micros = barData.filter(b => !pieLabels.has(b.label) && b.label.toLowerCase() !== 'calories');

      setNutriData({
        raw: payload,
        barData,
        pieData,
        micros,
        calories: (payload.calories !== undefined && Number.isFinite(Number(payload.calories))) ? Number(payload.calories) : null,
      });

      setNutriOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Nutrition fetch failed');
    }
  };

  if (!donation) return <div>Loading.</div>;

  return (
    <>
      <Card className="p-3">
        {donation.imageUrl && <Card.Img variant="top" src={donation.imageUrl} alt={donation.title} />}
        <Card.Body>
          <Card.Title>{donation.title}</Card.Title>
          <Card.Text>
            {donation.description}
            <br />
            <strong>Category:</strong> {donation.category} <br />
            <strong>Quantity:</strong> {donation.quantity} {donation.unit} <br />
            <strong>Expiry:</strong> {donation.expiryAt || 'N/A'} <br />
            <strong>Created by:</strong> {donation.createdByName}
          </Card.Text>

          {donation.pickupLat && donation.pickupLng && (
            <div style={{ height: 300, marginBottom: 12 }}>
              <MapContainer center={[donation.pickupLat, donation.pickupLng]} zoom={13} style={{ height: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[donation.pickupLat, donation.pickupLng]}>
                  <Popup>Pickup Location</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          <Form.Group className="mb-2">
            <Form.Label>Request Message</Form.Label>
            <Form.Control as="textarea" value={message} onChange={e => setMessage(e.target.value)} />
          </Form.Group>

          <div className="d-flex gap-2 flex-wrap">
            <LoadingButton variant="primary" onClickAsync={handleRequest}>Request Donation</LoadingButton>
            <LoadingButton variant="outline-primary" onClickAsync={handleGetNutrition}>Get Nutrition information</LoadingButton>
            <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          </div>
        </Card.Body>
      </Card>

      <Modal show={nutriOpen} onHide={() => setNutriOpen(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Nutrition — {donation.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {nutriData ? (
            <>
              <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 220, maxWidth: 260 }}>
                  <h5 style={{ marginBottom: 6 }}>Summary</h5>
                  <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>
                      {nutriData.calories !== null ? (
                        <>
                          {nutriData.calories} <span style={{ fontSize: 12, fontWeight: 400 }}>kcal</span>
                        </>
                      ) : (
                        <span className="text-muted">Calories N/A</span>
                      )}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <small className="text-muted">Automatically derived from AI.</small>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <h6 style={{ fontSize: 14, marginBottom: 6 }}>Top nutrients</h6>
                      <ul style={{ paddingLeft: 18, margin: 0 }}>
                        {nutriData.barData.slice(0, 5).map((b, i) => (
                          <li key={i}><small>{b.label}: {b.value}</small></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 360 }}>
                  <h6 style={{ marginBottom: 8 }}>Nutrient breakdown</h6>
                  {nutriData.barData.length > 0 ? (
                    <BarChart data={nutriData.barData} width={620} height={260} />
                  ) : (
                    <div className="text-muted">No numeric nutrient data returned.</div>
                  )}
                </div>

                <div style={{ width: 180, minWidth: 160 }}>
                  <h6 style={{ marginBottom: 8 }}>Distribution</h6>
                  {nutriData.pieData.length > 0 ? (
                    <>
                      <PieChart data={nutriData.pieData} size={140} />
                      <div style={{ marginTop: 8 }}>
                        {nutriData.pieData.map((p, i) => (
                          <div key={i}><small>{p.label}: {p.value}</small></div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-muted">No distribution available.</div>
                  )}
                </div>
              </div>

              <hr />

              <h6>Micronutrients & details</h6>
              {nutriData.micros.length > 0 ? (
                <Table size="sm" bordered responsive>
                  <thead>
                    <tr>
                      <th style={{ width: '60%' }}>Nutrient</th>
                      <th style={{ width: '40%' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nutriData.micros.map((m, i) => (
                      <tr key={i}>
                        <td>{m.label}</td>
                        <td>{m.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-muted">No micronutrient details returned.</div>
              )}

              <div style={{ marginTop: 8 }}>
                <h6 style={{ marginBottom: 6 }}>Raw response</h6>
                <pre style={{ maxHeight: 180, overflow: 'auto', background: '#f8f9fa', padding: 10 }}>{JSON.stringify(nutriData.raw, null, 2)}</pre>
              </div>
            </>
          ) : (
            <div>Loading nutrition...</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setNutriOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DonationDetails;
