// src/pages/MyDonations.jsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Modal } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import LoadingButton from '../components/LoadingButton';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tipsOpen, setTipsOpen] = useState(false);
  const [tipsFor, setTipsFor] = useState(null);
  const [tipsContent, setTipsContent] = useState(null);

  useEffect(() => {
    fetchMyDonations();
    // eslint-disable-next-line
  }, []);

  const fetchMyDonations = async () => {
    try {
      const res = await api.get('/donations/my');
      setDonations(res.data);
    } catch (err) {
      toast.error('Failed to load donations');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.post(`/donations/${id}/cancel`);
      toast.success('Donation cancelled');
      fetchMyDonations();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const handleGetStorageTips = async (donation) => {
    setTipsFor(donation);
    setTipsContent(null);
    setTipsOpen(true);
    try {
      const res = await api.get('/ai/storage-tips', { params: { name: donation.title || donation.description } });
      // Expecting an object like: { tips: "markdown-style string..." }
      setTipsContent(res.data);
    } catch (err) {
      setTipsContent({ error: 'Failed to fetch storage tips' });
    }
  };

  const expiryDates = donations
    .filter(d => d.expiryAt)
    .map(d => new Date(d.expiryAt));

  // --- Simple markdown-ish parser for the returned tips string ---
  const renderTipsMarkdown = (rawText) => {
    if (!rawText) return null;

    // Normalize line endings
    const text = String(rawText).replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Utility to convert inline **bold** into React <strong>
    const processInline = (str, keyPrefix = '') => {
      const parts = [];
      let lastIndex = 0;
      const boldRegex = /\*\*(.+?)\*\*/g;
      let match;
      let idx = 0;
      while ((match = boldRegex.exec(str)) !== null) {
        if (match.index > lastIndex) {
          parts.push(str.slice(lastIndex, match.index));
        }
        parts.push(
          <strong key={`${keyPrefix}-b-${idx}`} style={{ fontWeight: 700 }}>
            {match[1]}
          </strong>
        );
        lastIndex = match.index + match[0].length;
        idx += 1;
      }
      if (lastIndex < str.length) parts.push(str.slice(lastIndex));
      // If nothing matched, return original string for simpler rendering
      return parts.length === 0 ? str : parts;
    };

    const lines = text.split('\n');
    const nodes = [];
    let i = 0;
    let blockKey = 0;

    while (i < lines.length) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      // blank line => paragraph break
      if (line === '') {
        nodes.push(<div key={`br-${blockKey}`} style={{ height: 8 }} />);
        blockKey += 1;
        i += 1;
        continue;
      }

      // Bullet list (lines starting with "* " or "- ")
      if (/^(\*|-)\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^(\*|-)\s+/.test(lines[i].trim())) {
          const content = lines[i].trim().replace(/^(\*|-)\s+/, '');
          items.push(content);
          i += 1;
        }
        nodes.push(
          <ul key={`ul-${blockKey}`} style={{ paddingLeft: 18, marginTop: 6, marginBottom: 6 }}>
            {items.map((item, idx) => (
              <li key={`li-${blockKey}-${idx}`} style={{ marginBottom: 6, lineHeight: 1.4 }}>
                {processInline(item, `li-${blockKey}-${idx}`)}
              </li>
            ))}
          </ul>
        );
        blockKey += 1;
        continue;
      }

      // Otherwise a normal paragraph line. Collect consecutive non-empty non-bullet lines into one paragraph
      const paraLines = [];
      while (i < lines.length && lines[i].trim() !== '' && !/^(\*|-)\s+/.test(lines[i].trim())) {
        paraLines.push(lines[i].trim());
        i += 1;
      }
      const paragraph = paraLines.join(' ');
      nodes.push(
        <p key={`p-${blockKey}`} style={{ marginBottom: 8, lineHeight: 1.45 }}>
          {processInline(paragraph, `p-${blockKey}`)}
        </p>
      );
      blockKey += 1;
    }

    return nodes;
  };

  return (
    <>
      <h2>My Donations</h2>
      <Row>
        <Col md={8}>
          <Row>
            {donations.map(d => (
              <Col md={6} key={d.id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{d.title}</Card.Title>
                    <Card.Text>Status: {d.status}</Card.Text>
                    <div className="mb-2">
                      <small className="text-muted-small">Expiry: {d.expiryAt || 'N/A'}</small>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      {d.status !== 'CANCELLED' && (
                        <LoadingButton variant="danger" onClickAsync={async () => await handleCancel(d.id)}>
                          Cancel
                        </LoadingButton>
                      )}
                      <LoadingButton variant="outline-secondary" onClickAsync={async () => await handleGetStorageTips(d)}>
                        Get storage tips
                      </LoadingButton>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
        <Col md={4}>
          <h5>Expiry Calendar</h5>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={({ date }) => expiryDates.some(ed => ed.toDateString() === date.toDateString()) ? 'highlight' : null}
          />
        </Col>
      </Row>

      <Modal show={tipsOpen} onHide={() => setTipsOpen(false)} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Storage Tips — {tipsFor?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tipsContent ? (
            <>
              {tipsContent.error && <div className="text-danger">{tipsContent.error}</div>}
              {!tipsContent.error && (
                <>
                  {/* The AI returns a single string under `tips` (or sometimes the raw body as a string).
                      We parse that markdown-ish text and render it as React nodes (no dangerouslySetInnerHTML). */}
                  <div style={{ fontSize: 14, color: '#222' }}>
                    {(() => {
                      // Accept either { tips: "..." } or a string directly
                      const raw = (typeof tipsContent === 'string') ? tipsContent : (tipsContent.tips || tipsContent.text || '');
                      if (!raw || String(raw).trim() === '') {
                        return <div className="text-muted">No tips returned.</div>;
                      }
                      return renderTipsMarkdown(raw);
                    })()}
                  </div>
                </>
              )}
            </>
          ) : (
            <div>Loading tips...</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setTipsOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MyDonations;
