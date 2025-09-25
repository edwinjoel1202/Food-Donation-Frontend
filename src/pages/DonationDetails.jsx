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
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ');
  return spaced.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
};

const DonationDetails = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [message, setMessage] = useState('');
  const [nutriOpen, setNutriOpen] = useState(false);
  const [nutriData, setNutriData] = useState(null);

  // consume ratio states
  const [consumeOpen, setConsumeOpen] = useState(false);
  const [consumeData, setConsumeData] = useState(null);

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
      setMessage('');
      fetchDonation();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request');
    }
  };

    // const handleGetNutrition = async () => {
  //   if (!donation) return;
  //   try {
  //     const res = await api.get('/ai/nutrition', {
  //       params: {
  //         name: donation.title || donation.description,
  //         quantity: donation.quantity || 1,
  //         unit: donation.unit || 'piece',
  //       },
  //     });

  //     const payload = res.data || {};

  //     // Normalize numeric key/value pairs
  //     const numericEntries = Object.entries(payload)
  //       .filter(([k, v]) => typeof v === 'number' && Number.isFinite(v))
  //       .map(([k, v]) => ({ key: k, label: humanize(k), value: Number(v) }));

  //     // If API returns numbers as strings, try to coerce those too
  //     const stringNumericEntries = Object.entries(payload)
  //       .filter(([k, v]) => typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)))
  //       .map(([k, v]) => ({ key: k, label: humanize(k), value: Number(v) }));

  //     const allEntriesMap = new Map();
  //     numericEntries.forEach(e => allEntriesMap.set(e.key, e));
  //     stringNumericEntries.forEach(e => {
  //       if (!allEntriesMap.has(e.key)) allEntriesMap.set(e.key, e);
  //     });

  //     const allEntries = Array.from(allEntriesMap.values());

  //     // Sort descending by value for bar chart
  //     const barData = allEntries.slice().sort((a, b) => b.value - a.value).map(e => ({ label: e.label, value: e.value }));

  //     // Identify macros for pie chart preference
  //     const macroKeysPreferred = ['protein', 'carbohydrates', 'carbs', 'fats', 'fat', 'fiber', 'sugars', 'sugar'];
  //     const macroEntries = [];
  //     const otherEntries = [];

  //     allEntries.forEach(e => {
  //       if (macroKeysPreferred.includes(e.key)) macroEntries.push(e);
  //       else otherEntries.push(e);
  //     });

  //     // If macros present, use them for pie chart (exclude calories)
  //     let pieData = [];
  //     if (macroEntries.length > 0) {
  //       // combine duplicates like 'carbs' and 'carbohydrates' if both present - by label
  //       const merged = new Map();
  //       macroEntries.forEach(e => {
  //         const lbl = e.label;
  //         merged.set(lbl, (merged.get(lbl) || 0) + e.value);
  //       });
  //       pieData = Array.from(merged.entries()).map(([label, value]) => ({ label, value }));
  //       // if pie sum is zero or trivial, fallback to top-5 barData without calories
  //       const sumPie = pieData.reduce((s, p) => s + Math.abs(p.value), 0);
  //       if (sumPie === 0) pieData = [];
  //     }

  //     if (pieData.length === 0) {
  //       // fallback: top 5 values excluding calories (calories is absolute energy, not a composition)
  //       const fallback = barData.filter(b => b.label.toLowerCase() !== 'calories').slice(0, 5);
  //       pieData = fallback.length ? fallback : barData.slice(0, Math.min(5, barData.length));
  //     }

  //     // Micro nutrients: keep those that are not in pie (and not calories)
  //     const pieLabels = new Set(pieData.map(p => p.label));
  //     const micros = barData.filter(b => !pieLabels.has(b.label) && b.label.toLowerCase() !== 'calories');

  //     setNutriData({
  //       raw: payload,
  //       barData,
  //       pieData,
  //       micros,
  //       calories: (payload.calories !== undefined && Number.isFinite(Number(payload.calories))) ? Number(payload.calories) : null,
  //     });

  //     setNutriOpen(true);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error('Nutrition fetch failed');
  //   }
  // };

  const handleGetNutrition = async () => {
    if (!donation) return;
    setNutriOpen(true);
    setNutriData(null);
    try {
      const res = await api.get('/ai/nutrition', { params: { name: donation.title || donation.description, quantity: donation.quantity || 1, unit: donation.unit || 'kg' }});
      setNutriData(res.data);
    } catch (err) {
      setNutriData({ error: err.response?.data?.error || 'Failed to fetch nutrition' });
    }
  };

  const handleConsumeRatio = async () => {
    if (!donation) return;
    setConsumeOpen(true);
    setConsumeData(null);
    try {
      const res = await api.get('/ai/consume-ratio', { params: { name: donation.title || donation.description || '', quantity: donation.quantity || 1, unit: donation.unit || 'kg' }});
      setConsumeData(res.data);
    } catch (err) {
      setConsumeData({ error: err.response?.data?.error || 'Failed to fetch consume ratio' });
    }
  };

  return (
    <>
      <h2>Donation Details</h2>
      {!donation ? (
        <div>Loading donation...</div>
      ) : (
        <Card>
          {donation.imageUrl && <Card.Img variant="top" src={donation.imageUrl} alt={donation.title} />}
          <Card.Body>
            <Card.Title>{donation.title}</Card.Title>
            <Card.Text>
              <span className="text-muted-small">Category:</span> {donation.category}<br/>
              <span className="text-muted-small">Quantity:</span> {donation.quantity} {donation.unit}<br/>
              <span className="text-muted-small">Status:</span> {donation.status}<br/>
              <span className="text-muted-small">Donor:</span> {donation.createdByName || 'Unknown'}<br/>
            </Card.Text>

            {donation.pickupLat && donation.pickupLng && (
              <div style={{ height: 160, marginBottom: 8 }}>
                <MapContainer center={[donation.pickupLat, donation.pickupLng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[donation.pickupLat, donation.pickupLng]}>
                    <Popup>Pickup Location</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}

            <div className="d-flex gap-2">
              <LoadingButton variant="success" onClickAsync={async () => { await handleRequest(); }}>
                Request
              </LoadingButton>

              <LoadingButton variant="outline-primary" onClickAsync={async () => { await handleGetNutrition(); }}>
                Nutrition
              </LoadingButton>

              <LoadingButton variant="outline-success" onClickAsync={async () => { await handleConsumeRatio(); }}>
                Find Consume Ratio 🚀
              </LoadingButton>

              <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
            </div>

            <hr/>

            <h5>Request message</h5>
            <Form.Control as="textarea" rows={2} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write a short message to donor (optional)"/>
          </Card.Body>
        </Card>
      )}

      {/* Nutrition modal */}
      <Modal show={nutriOpen} onHide={() => setNutriOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nutrition Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {nutriData ? (
            nutriData.error ? <div>{nutriData.error}</div> : (
              <>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h6>Summary</h6>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(nutriData, null, 2)}</pre>
                  </div>
                </div>
                <hr/>
                <h6>Raw response</h6>
                <pre style={{ maxHeight: 240, overflow: 'auto', background: '#f8f9fa', padding: 10 }}>{JSON.stringify(nutriData.raw || nutriData, null, 2)}</pre>
              </>
            )
          ) : (
            <div>Loading nutrition.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setNutriOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Consume Ratio modal */}
      <Modal show={consumeOpen} onHide={() => setConsumeOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Consume Ratio Predictions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {consumeData ? (
            consumeData.error ? (
              <div className="text-danger">{consumeData.error}</div>
            ) : (
              <>
                <p><strong>Explanation:</strong> {consumeData.explanation}</p>

                {/* variants -> render bar chart */}
                {Array.isArray(consumeData.variants) && consumeData.variants.length > 0 ? (
                  <>
                    <h6>Predicted persons for different portion sizes</h6>
                    <BarChart data={consumeData.variants.map(v => ({ label: v.label, value: Number(v.persons || 0) }))} width={560} height={160} />
                    <div className="mt-3">
                      <Table bordered size="sm">
                        <thead>
                          <tr>
                            <th>Variant</th>
                            <th>Persons</th>
                            <th>Serving</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consumeData.variants.map((v, i) => (
                            <tr key={i}>
                              <td>{v.label}</td>
                              <td>{v.persons}</td>
                              <td>{v.serving_g ? `${v.serving_g} g` : v.serving_ml ? `${v.serving_ml} ml` : v.piecesPerPerson ? `${v.piecesPerPerson} pcs/person` : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div>No variant predictions available.</div>
                )}

                {consumeData.aiNote && (
                  <>
                    <hr/>
                    <h6>AI note (optional)</h6>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{consumeData.aiNote}</pre>
                  </>
                )}
              </>
            )
          ) : (
            <div>Loading predictions...</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConsumeOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DonationDetails;
